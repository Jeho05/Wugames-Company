"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ApiDataState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: Error };

export function useApiData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): ApiDataState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiDataState<T>>({ status: "loading", data: null, error: null });
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);

  const run = useCallback(() => {
    setState({ status: "loading", data: null, error: null });
    fetcherRef.current()
      .then((data) => {
        if (mountedRef.current) setState({ status: "success", data, error: null });
      })
      .catch((err) => {
        if (mountedRef.current) setState({ status: "error", data: null, error: err instanceof Error ? err : new Error(String(err)) });
      });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetcherRef.current = fetcher;
    // Chargement initial (fetch dans l'effet, usage canonique).
    /* eslint-disable react-hooks/set-state-in-effect -- fetch initial, état loading */
    run();
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refetch: run };
}
