import { useCallback, useMemo, useState } from 'react';

export type RowKey = string | number;

export function useRowSelection(keys: RowKey[]) {
    const [selected, setSelected] = useState<Set<RowKey>>(new Set());

    const selectedKeys = useMemo(
        () => keys.filter((key) => selected.has(key)),
        [keys, selected],
    );

    const toggleRow = useCallback((key: RowKey) => {
        setSelected((current) => {
            const next = new Set(current);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    }, []);

    const toggleAll = useCallback(() => {
        setSelected((current) => {
            if (keys.length > 0 && keys.every((key) => current.has(key))) {
                return new Set();
            }

            return new Set(keys);
        });
    }, [keys]);

    const clear = useCallback(() => {
        setSelected(new Set());
    }, []);

    const allSelected =
        keys.length > 0 && keys.every((key) => selected.has(key));
    const someSelected = !allSelected && keys.some((key) => selected.has(key));

    return {
        selected,
        selectedKeys,
        toggleRow,
        toggleAll,
        clear,
        allSelected,
        someSelected,
        hasSelection: selected.size > 0,
    };
}
