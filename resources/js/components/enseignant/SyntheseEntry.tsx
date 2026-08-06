import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import StatCard from '@/components/ui/StatCard';
import { apiFetch } from '@/lib/auth';

type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
};

type Synthese = {
    id_synthese: number;
    trimestre: string;
    statut: string;
    niveau_alerte: 'faible' | 'moyen' | 'eleve' | null;
    niveau_alerte_corrige: 'faible' | 'moyen' | 'eleve' | null;
    facteurs_risque: string[];
    signaux_textuels: string[];
    recommandations: string[];
    message_parent: string | null;
    genere_le: string | null;
};

const TRIMESTRES = ['T1', 'T2'] as const;

const NIVEAUX_ALERTE: Array<'faible' | 'moyen' | 'eleve'> = [
    'faible',
    'moyen',
    'eleve',
];

const NIVEAU_ALERTE_LABELS: Record<string, string> = {
    faible: 'Faible',
    moyen: 'Moyen',
    eleve: 'Élevé',
};

const NIVEAU_ALERTE_TONE: Record<
    'faible' | 'moyen' | 'eleve',
    'success' | 'warning' | 'danger'
> = {
    faible: 'success',
    moyen: 'warning',
    eleve: 'danger',
};

type Props = {
    eleve: Eleve;
    trimestre?: string;
};

export default function SyntheseEntry({ eleve, trimestre }: Props) {
    const [synthese, setSynthese] = useState<Synthese | null>(null);
    const [syntheseEtat, setSyntheseEtat] = useState<
        'chargement' | 'introuvable' | 'pret' | 'erreur'
    >('chargement');
    const [syntheseErreur, setSyntheseErreur] = useState<string | null>(null);
    const [syntheseSuccess, setSyntheseSuccess] = useState<string | null>(null);
    const [trimestreSynthese, setTrimestreSynthese] = useState(
        trimestre ?? 'T1',
    );
    const [niveauCorrige, setNiveauCorrige] = useState('');
    const [syntheseGenerating, setSyntheseGenerating] = useState(false);
    const [correctionProcessing, setCorrectionProcessing] = useState(false);
    const [envoiProcessing, setEnvoiProcessing] = useState(false);
    const [loadVersion, setLoadVersion] = useState(0);

    const [trimestrePrecedent, setTrimestrePrecedent] = useState(trimestre);

    if (trimestre !== undefined && trimestrePrecedent !== trimestre) {
        setTrimestrePrecedent(trimestre);
        setTrimestreSynthese(trimestre);
    }

    useEffect(() => {
        apiFetch(
            `/api/eleves/${eleve.id_eleve}/synthese?trimestre=${encodeURIComponent(trimestreSynthese)}`,
        )
            .then(async (response) => {
                if (response.status === 404) {
                    setSynthese(null);
                    setSyntheseEtat('introuvable');

                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    setSyntheseEtat('erreur');
                    setSyntheseErreur(
                        data.message ??
                            'Erreur lors du chargement de la synthèse.',
                    );

                    return;
                }

                setSynthese(data as Synthese);
                setSyntheseEtat('pret');
                setNiveauCorrige(
                    data.niveau_alerte_corrige ?? data.niveau_alerte ?? '',
                );
            })
            .catch(() => {
                setSyntheseEtat('erreur');
                setSyntheseErreur('Impossible de charger la synthèse.');
            });
    }, [eleve.id_eleve, loadVersion, trimestreSynthese]);

    function handleTrimestre(value: string) {
        setTrimestreSynthese(value);
        setSyntheseEtat('chargement');
        setSyntheseErreur(null);
        setSyntheseSuccess(null);
    }

    function actualiser() {
        setSyntheseEtat('chargement');
        setLoadVersion((version) => version + 1);
    }

    async function genererSynthese() {
        setSyntheseGenerating(true);
        setSyntheseEtat('chargement');
        setSyntheseErreur(null);
        setSyntheseSuccess(null);

        try {
            const response = await apiFetch(
                `/api/eleves/${eleve.id_eleve}/synthese`,
                {
                    method: 'POST',
                    body: JSON.stringify({ trimestre: trimestreSynthese }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setSyntheseGenerating(false);
                setSyntheseEtat(synthese ? 'pret' : 'introuvable');
                setSyntheseErreur(
                    data.message ??
                        'Erreur lors du déclenchement de la synthèse.',
                );

                return;
            }

            setSyntheseGenerating(false);
            setLoadVersion((version) => version + 1);
        } catch {
            setSyntheseGenerating(false);
            setSyntheseEtat('erreur');
            setSyntheseErreur('Une erreur est survenue lors de la génération.');
        }
    }

    async function corrigerNiveau() {
        if (!synthese) {
            return;
        }

        setCorrectionProcessing(true);
        setSyntheseErreur(null);
        setSyntheseSuccess(null);

        try {
            const response = await apiFetch(
                `/api/syntheses/${synthese.id_synthese}/niveau-alerte`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        niveau_alerte_corrige: niveauCorrige,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setCorrectionProcessing(false);
                setSyntheseErreur(
                    data.message ??
                        "Erreur lors de la correction du niveau d'alerte.",
                );

                return;
            }

            setSynthese(data as Synthese);
            setNiveauCorrige(
                data.niveau_alerte_corrige ?? data.niveau_alerte ?? '',
            );
            setSyntheseSuccess("Niveau d'alerte corrigé.");
            setCorrectionProcessing(false);
        } catch {
            setCorrectionProcessing(false);
            setSyntheseErreur('Une erreur est survenue.');
        }
    }

    async function envoyerSynthese() {
        if (!synthese) {
            return;
        }

        setEnvoiProcessing(true);
        setSyntheseErreur(null);
        setSyntheseSuccess(null);

        try {
            const response = await apiFetch(
                `/api/syntheses/${synthese.id_synthese}/envoyer`,
                { method: 'POST' },
            );

            const data = await response.json();

            if (!response.ok) {
                setEnvoiProcessing(false);
                setSyntheseErreur(
                    data.message ?? "Erreur lors de l'envoi aux parents.",
                );

                return;
            }

            setSyntheseSuccess(
                `Notifications envoyées à ${String(data.nombre_tuteurs)} tuteur(s).`,
            );
            setEnvoiProcessing(false);
        } catch {
            setEnvoiProcessing(false);
            setSyntheseErreur("Une erreur est survenue lors de l'envoi.");
        }
    }

    const niveauAffiche =
        synthese?.niveau_alerte_corrige ?? synthese?.niveau_alerte;

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Synthèse IA
                </h3>
                {trimestre === undefined && (
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="synthese-trimestre"
                            className="text-sm text-slate-500 dark:text-slate-400"
                        >
                            Trimestre
                        </label>
                        <Select
                            id="synthese-trimestre"
                            value={trimestreSynthese}
                            onChange={(e) => handleTrimestre(e.target.value)}
                        >
                            {TRIMESTRES.map((trimestre) => (
                                <option key={trimestre} value={trimestre}>
                                    {trimestre}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}
            </div>

            {syntheseErreur && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                    {syntheseErreur}
                </div>
            )}

            {syntheseSuccess && (
                <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
                    {syntheseSuccess}
                </div>
            )}

            {syntheseEtat === 'chargement' && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chargement de la synthèse...
                </p>
            )}

            {syntheseEtat === 'introuvable' && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Aucune synthèse générée pour le trimestre{' '}
                        {trimestreSynthese}.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            onClick={genererSynthese}
                            disabled={syntheseGenerating}
                        >
                            {syntheseGenerating
                                ? 'Génération...'
                                : 'Générer la synthèse'}
                        </Button>
                        <button
                            type="button"
                            onClick={actualiser}
                            className="rounded-sm border border-slate-300 px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                        >
                            Actualiser
                        </button>
                    </div>
                </div>
            )}

            {syntheseEtat === 'erreur' && (
                <button
                    type="button"
                    onClick={actualiser}
                    className="rounded-sm border border-slate-300 px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                >
                    Réessayer
                </button>
            )}

            {syntheseEtat === 'pret' && synthese && (
                <div className="space-y-4">
                    {synthese.statut === 'en_attente' && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Synthèse en attente de génération. Actualisez
                                pour voir le résultat.
                            </p>
                            <button
                                type="button"
                                onClick={actualiser}
                                className="rounded-sm border border-slate-300 px-5 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                            >
                                Actualiser
                            </button>
                        </div>
                    )}

                    {synthese.statut === 'echoue' && (
                        <div className="space-y-4">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                La génération de la synthèse a échoué.
                                Réessayez.
                            </p>
                            <Button
                                type="button"
                                onClick={genererSynthese}
                                disabled={syntheseGenerating}
                            >
                                {syntheseGenerating
                                    ? 'Génération...'
                                    : 'Réessayer'}
                            </Button>
                        </div>
                    )}

                    {synthese.statut === 'traite' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <StatCard
                                    label="Facteurs de risque"
                                    value={String(
                                        synthese.facteurs_risque?.length ?? 0,
                                    )}
                                    className="!p-4"
                                />
                                <StatCard
                                    label="Recommandations"
                                    value={String(
                                        synthese.recommandations?.length ?? 0,
                                    )}
                                    className="!p-4"
                                />
                                <StatCard
                                    label="Trimestre"
                                    value={trimestreSynthese}
                                    className="!p-4"
                                />
                            </div>

                            <Card className="!p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                            Niveau d'alerte
                                        </span>
                                        {niveauAffiche && (
                                            <Badge
                                                tone={
                                                    NIVEAU_ALERTE_TONE[
                                                        niveauAffiche
                                                    ]
                                                }
                                                className="px-2.5 py-1 text-sm"
                                            >
                                                {
                                                    NIVEAU_ALERTE_LABELS[
                                                        niveauAffiche
                                                    ]
                                                }
                                            </Badge>
                                        )}
                                    </div>
                                    {synthese.niveau_alerte_corrige &&
                                        synthese.niveau_alerte &&
                                        synthese.niveau_alerte_corrige !==
                                            synthese.niveau_alerte && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                Corrigé depuis :{' '}
                                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                                    {
                                                        NIVEAU_ALERTE_LABELS[
                                                            synthese
                                                                .niveau_alerte
                                                        ]
                                                    }
                                                </span>
                                            </span>
                                        )}
                                </div>
                            </Card>

                            <div>
                                <h4 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Facteurs de risque
                                </h4>
                                {synthese.facteurs_risque?.length ? (
                                    <div className="space-y-2">
                                        {synthese.facteurs_risque.map(
                                            (facteur, index) => (
                                                <Card
                                                    key={index}
                                                    className="!p-3 !shadow-none"
                                                >
                                                    <p className="text-sm text-slate-900 dark:text-slate-100">
                                                        {facteur}
                                                    </p>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Aucun facteur identifié.
                                    </p>
                                )}
                            </div>

                            <div>
                                <h4 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Recommandations
                                </h4>
                                {synthese.recommandations?.length ? (
                                    <div className="space-y-2">
                                        {synthese.recommandations.map(
                                            (recommandation, index) => (
                                                <Card
                                                    key={index}
                                                    className="!p-3 !shadow-none"
                                                >
                                                    <p className="text-sm text-slate-900 dark:text-slate-100">
                                                        {recommandation}
                                                    </p>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Aucune recommandation.
                                    </p>
                                )}
                            </div>

                            <div>
                                <h4 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Message aux parents
                                </h4>
                                {synthese.message_parent ? (
                                    <Card className="!p-4 !shadow-none">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                                            {synthese.message_parent}
                                        </p>
                                    </Card>
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Aucun message disponible.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label
                                        htmlFor="synthese-niveau-corrige"
                                        className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                                    >
                                        Corriger le niveau d'alerte
                                    </label>
                                    <Select
                                        id="synthese-niveau-corrige"
                                        value={niveauCorrige}
                                        onChange={(e) =>
                                            setNiveauCorrige(e.target.value)
                                        }
                                    >
                                        <option value="">Aucun</option>
                                        {NIVEAUX_ALERTE.map((niveau) => (
                                            <option key={niveau} value={niveau}>
                                                {NIVEAU_ALERTE_LABELS[niveau]}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <Button
                                    type="button"
                                    onClick={corrigerNiveau}
                                    disabled={correctionProcessing}
                                >
                                    {correctionProcessing
                                        ? 'Enregistrement...'
                                        : 'Enregistrer'}
                                </Button>
                            </div>

                            <Button
                                type="button"
                                onClick={envoyerSynthese}
                                disabled={
                                    envoiProcessing || !synthese.message_parent
                                }
                            >
                                {envoiProcessing
                                    ? 'Envoi...'
                                    : 'Envoyer aux parents'}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
