import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
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

const NIVEAUX_ALERTE: Array<'faible' | 'moyen' | 'eleve'> = ['faible', 'moyen', 'eleve'];

const NIVEAU_ALERTE_LABELS: Record<string, string> = {
    faible: 'Faible',
    moyen: 'Moyen',
    eleve: 'Élevé',
};

const NIVEAU_ALERTE_BADGE: Record<string, string> = {
    faible: 'rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    moyen: 'rounded bg-yellow-500/10 px-1.5 py-0.5 text-xs text-yellow-700 dark:text-yellow-400',
    eleve: 'rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

type Props = {
    eleve: Eleve;
};

export default function SyntheseEntry({ eleve }: Props) {
    const [synthese, setSynthese] = useState<Synthese | null>(null);
    const [syntheseEtat, setSyntheseEtat] = useState<
        'chargement' | 'introuvable' | 'pret' | 'erreur'
    >('chargement');
    const [syntheseErreur, setSyntheseErreur] = useState<string | null>(null);
    const [syntheseSuccess, setSyntheseSuccess] = useState<string | null>(null);
    const [trimestreSynthese, setTrimestreSynthese] = useState('T1');
    const [niveauCorrige, setNiveauCorrige] = useState('');
    const [syntheseGenerating, setSyntheseGenerating] = useState(false);
    const [correctionProcessing, setCorrectionProcessing] = useState(false);
    const [envoiProcessing, setEnvoiProcessing] = useState(false);
    const [loadVersion, setLoadVersion] = useState(0);

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
                        data.message ?? 'Erreur lors du chargement de la synthèse.',
                    );

                    return;
                }

                setSynthese(data as Synthese);
                setSyntheseEtat('pret');
                setNiveauCorrige(data.niveau_alerte_corrige ?? data.niveau_alerte ?? '');
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
            const response = await apiFetch(`/api/eleves/${eleve.id_eleve}/synthese`, {
                method: 'POST',
                body: JSON.stringify({ trimestre: trimestreSynthese }),
            });

            const data = await response.json();

            if (!response.ok) {
                setSyntheseGenerating(false);
                setSyntheseEtat(synthese ? 'pret' : 'introuvable');
                setSyntheseErreur(
                    data.message ?? 'Erreur lors du déclenchement de la synthèse.',
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
                    body: JSON.stringify({ niveau_alerte_corrige: niveauCorrige }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                setCorrectionProcessing(false);
                setSyntheseErreur(
                    data.message ?? "Erreur lors de la correction du niveau d'alerte.",
                );

                return;
            }

            setSynthese(data as Synthese);
            setNiveauCorrige(data.niveau_alerte_corrige ?? data.niveau_alerte ?? '');
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
            setSyntheseErreur('Une erreur est survenue lors de l\'envoi.');
        }
    }

    function alerteBadge(niveau: string | null | undefined) {
        if (!niveau) {
            return null;
        }

        return (
            <span className={NIVEAU_ALERTE_BADGE[niveau] ?? ''}>
                {NIVEAU_ALERTE_LABELS[niveau] ?? niveau}
            </span>
        );
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Synthèse IA
                </h3>
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
                        Aucune synthèse générée pour le trimestre {trimestreSynthese}.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            onClick={genererSynthese}
                            disabled={syntheseGenerating}
                        >
                            {syntheseGenerating ? 'Génération...' : 'Générer la synthèse'}
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
                                Synthèse en attente de génération. Actualisez pour voir
                                le résultat.
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
                                La génération de la synthèse a échoué. Réessayez.
                            </p>
                            <Button
                                type="button"
                                onClick={genererSynthese}
                                disabled={syntheseGenerating}
                            >
                                {syntheseGenerating ? 'Génération...' : 'Réessayer'}
                            </Button>
                        </div>
                    )}

                    {synthese.statut === 'traite' && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    Niveau d'alerte
                                </span>
                                {alerteBadge(synthese.niveau_alerte)}
                                {synthese.niveau_alerte_corrige && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Corrigé : {alerteBadge(synthese.niveau_alerte_corrige)}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h4 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Facteurs de risque
                                </h4>
                                {synthese.facteurs_risque?.length ? (
                                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-900 dark:text-slate-100">
                                        {synthese.facteurs_risque.map((facteur, index) => (
                                            <li key={index}>{facteur}</li>
                                        ))}
                                    </ul>
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
                                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-900 dark:text-slate-100">
                                        {synthese.recommandations.map((recommandation, index) => (
                                            <li key={index}>{recommandation}</li>
                                        ))}
                                    </ul>
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
                                    <p className="whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">
                                        {synthese.message_parent}
                                    </p>
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
                                        onChange={(e) => setNiveauCorrige(e.target.value)}
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
                                disabled={envoiProcessing || !synthese.message_parent}
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
