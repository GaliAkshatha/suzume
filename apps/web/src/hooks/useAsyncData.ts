import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../services/api/client";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
        setState({ data: null, loading: false, error: message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
