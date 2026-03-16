import { useState, useCallback } from "react";

export function useLocalStorageTodos(storageKey: string) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback(
    (id: string) => {
      setCheckedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        localStorage.setItem(storageKey, JSON.stringify([...next]));
        return next;
      });
    },
    [storageKey]
  );

  const isChecked = useCallback((id: string) => checkedIds.has(id), [checkedIds]);

  return { isChecked, toggle };
}
