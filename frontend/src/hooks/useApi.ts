// src/hooks/useApi.ts
// ============================================================
// Generic hook that wraps any async API call.
// Gives you: data, loading state, error, and a refetch function.
//
// Usage:
//   const { data, loading, error } = useApi(() => fetchUser());
// ============================================================

import { useState, useEffect, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(fn: () => Promise<T>): ApiState<T> {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fn()
      .then(result => { if (!cancelled) { setData(result); setLoading(false); } })
      .catch(err   => { if (!cancelled) { setError(err.message); setLoading(false); } });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { data, loading, error, refetch };
}

// ---- Pagination hook ----
// Wraps useApi with offset/limit state and next/prev helpers.
export function usePaginated<T>(
  fn: (limit: number, offset: number) => Promise<T>,
  limit = 20
) {
  const [offset, setOffset] = useState(0);

  const { data, loading, error, refetch } = useApi<T>(() => fn(limit, offset));

  const next = () => setOffset(o => o + limit);
  const prev = () => setOffset(o => Math.max(0, o - limit));
  const reset = () => setOffset(0);

  // Refetch when offset changes
  useEffect(() => { refetch(); }, [offset]);

  return { data, loading, error, offset, limit, next, prev, reset, refetch };
}
