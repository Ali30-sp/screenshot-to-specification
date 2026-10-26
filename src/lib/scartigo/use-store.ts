import { useCallback, useEffect, useState } from "react";
import { subscribe } from "./services";

/** Loads data from a service on the client, re-reads on any change. */
export function useStore<T>(load: () => T) {
  const [state, setState] = useState<{ data?: T; loading: boolean; error: boolean }>({ loading: true, error: false });
  const run = useCallback(() => {
    try { setState({ data: load(), loading: false, error: false }); }
    catch { setState({ loading: false, error: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { const t = setTimeout(run, 250); const un = subscribe(run); return () => { clearTimeout(t); un(); }; }, [run]);
  return { ...state, retry: () => { setState({ loading: true, error: false }); setTimeout(run, 250); } };
}
