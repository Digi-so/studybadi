import { useCallback, useEffect, useState } from "react";

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

/** localStorage-backed state. Reads after hydration to avoid SSR mismatches. */
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setValue(readStore(key, fallback));
    setReady(true);
    const onChange = (e: Event) => {
      const k = (e as CustomEvent).detail;
      if (k === key || k === "*") setValue(readStore(key, fallback));
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        if (!writeStore(key, v)) setError(true);
        return v;
      });
    },
    [key],
  );

  return [value, update, { ready, error }] as const;
}
