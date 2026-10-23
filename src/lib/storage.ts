import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "asb:";
const EVENT = "asb-storage";

export function readStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
    return true;
  } catch {
    return false;
  }
}

export function clearAllStore() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: "*" }));
  } catch {
    /* storage unavailable */
  }
}

/** localStorage-backed state. Reads after hydration to avoid SSR mismatches.
 *  The state updater stays pure (no writes inside it); persistence happens in
 *  an effect, otherwise the synchronous storage event re-enters setState and
 *  can apply the same update twice. */
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    setValue(readStore(key, fallback));
    loadedRef.current = true;
    setReady(true);
    const onChange = (e: Event) => {
      const k = (e as CustomEvent).detail;
      if (k === key || k === "*") setValue(readStore(key, fallback));
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist after the stored value has been read; skip the initial render so
  // the fallback never overwrites what is already saved.
  useEffect(() => {
    if (!loadedRef.current) return;
    if (!writeStore(key, value)) setError(true);
  }, [key, value, ready]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => (typeof next === "function" ? (next as (p: T) => T)(prev) : next));
    },
    [key],
  );

  return [value, update, { ready, error }] as const;
}
