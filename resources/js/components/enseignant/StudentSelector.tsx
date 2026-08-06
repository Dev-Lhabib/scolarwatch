import { useState } from 'react';
import type { ChangeEvent } from 'react';

export type Eleve = {
    id_eleve: number;
    nom: string;
    prenom: string;
};

type Props = {
    students: Eleve[];
    selectedId: number | null;
    onSelect: (eleve: Eleve) => void;
};

export default function StudentSelector({
    students,
    selectedId,
    onSelect,
}: Props) {
    const [search, setSearch] = useState('');

    const filtered = students.filter((eleve) =>
        `${eleve.nom} ${eleve.prenom}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
    );

    return (
        <div className="space-y-3">
            <div>
                <label
                    htmlFor="student-search"
                    className="mb-1 block text-sm font-medium text-slate-900 dark:text-slate-100"
                >
                    Rechercher un élève
                </label>
                <input
                    id="student-search"
                    type="search"
                    value={search}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Nom, prénom..."
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
            </div>

            {filtered.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Aucun élève ne correspond à votre recherche.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm text-slate-900 dark:text-slate-100">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Nom
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">
                                    Prénom
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((eleve) => {
                                const isSelected =
                                    eleve.id_eleve === selectedId;

                                return (
                                    <tr
                                        key={eleve.id_eleve}
                                        onClick={() => onSelect(eleve)}
                                        className={`cursor-pointer border-b border-slate-200 transition-colors dark:border-slate-800 ${
                                            isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        <td
                                            className={`px-3 py-2 font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : ''}`}
                                        >
                                            {eleve.nom}
                                        </td>
                                        <td
                                            className={`px-3 py-2 ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : ''}`}
                                        >
                                            {eleve.prenom}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
