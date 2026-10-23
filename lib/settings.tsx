"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "arabic-learner.settings.v1";

interface Settings {
  // The user can already decode/recite Arabic script — hide transliteration
  // and reframe the tashkīl control as a grammar test. Default on.
  canReadArabic: boolean;
}

const DEFAULTS: Settings = { canReadArabic: true };

interface SettingsContextValue extends Settings {
  ready: boolean;
  setCanReadArabic: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings, ready]);

  const setCanReadArabic = useCallback(
    (v: boolean) => setSettings((s) => ({ ...s, canReadArabic: v })),
    []
  );

  return (
    <SettingsContext.Provider
      value={{ ...settings, ready, setCanReadArabic }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
