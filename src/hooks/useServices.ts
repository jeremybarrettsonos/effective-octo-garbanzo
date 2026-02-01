import { useState, useEffect } from 'react';
import { POPULAR_PROVIDERS } from '../services/justwatch';
import type { Provider } from '../types/justwatch';

const STORAGE_KEY = 'streamfinder-services';

export function useServices() {
  const [selectedIds, setSelectedIds] = useState<number[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const isSelected = (id: number) => selectedIds.includes(id);

  const selectedProviders: Provider[] = POPULAR_PROVIDERS.filter((p) =>
    selectedIds.includes(p.id)
  );

  return {
    providers: POPULAR_PROVIDERS,
    selectedIds,
    selectedProviders,
    toggle,
    isSelected,
  };
}
