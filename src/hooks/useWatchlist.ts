import { useState, useEffect, useCallback } from 'react';
import type { Title } from '../types/justwatch';

const STORAGE_KEY = 'streamfinder-watchlist';

interface WatchlistItem {
  id: number;
  type: 'movie' | 'show';
  title: string;
  poster: string | null;
  year: number;
  addedAt: number;
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((title: Title) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === title.id && i.type === title.object_type);
      if (exists) return prev;

      return [
        ...prev,
        {
          id: title.id,
          type: title.object_type,
          title: title.title,
          poster: title.poster,
          year: title.original_release_year,
          addedAt: Date.now(),
        },
      ];
    });
  }, []);

  const remove = useCallback((id: number, type: 'movie' | 'show') => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
  }, []);

  const isInWatchlist = useCallback(
    (id: number, type: 'movie' | 'show') => {
      return items.some((i) => i.id === id && i.type === type);
    },
    [items]
  );

  return { items, add, remove, isInWatchlist };
}
