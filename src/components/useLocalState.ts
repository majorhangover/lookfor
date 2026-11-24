"use client";

import { useEffect, useState } from "react";

/**
 * State persisted to localStorage. Family data stays on the parent's device.
 * Only used in client-only components, so localStorage is always available.
 */
export function useLocalState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {}
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
