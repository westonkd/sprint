import { useEffect, useState } from "react";
import { type SprintTheme, THEME_ATTRIBUTE } from "../src/index.ts";

const THEME_KEY = "sprint-theme";

export const THEME_OPTIONS: readonly { value: SprintTheme; label: string }[] = [
  { value: "dark", label: "dark" },
  { value: "light", label: "light" },
  { value: "calorie", label: "calorie" },
  { value: "calorie-dark", label: "calorie dark" },
  { value: "trax", label: "trax" },
  { value: "trax-dark", label: "trax dark" },
];

export const VIEW_OPTIONS = [
  { value: "human", label: "human" },
  { value: "agent", label: "agent" },
];

export function asTheme(value: string): SprintTheme {
  const known = THEME_OPTIONS.find((option) => option.value === value);
  return known?.value ?? "dark";
}

function initialTheme(): SprintTheme {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored !== null) return asTheme(stored);
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function useTheme(): [SprintTheme, (theme: SprintTheme) => void] {
  const [theme, setTheme] = useState<SprintTheme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return [theme, setTheme];
}
