import { useEffect, useState } from "react";
import { type SprintTheme, THEME_ATTRIBUTE } from "../src/index.ts";

const THEME_KEY = "sprint-theme";

export const THEME_OPTIONS = [
  { value: "dark", label: "dark" },
  { value: "light", label: "light" },
];

export const VIEW_OPTIONS = [
  { value: "human", label: "human" },
  { value: "agent", label: "agent" },
];

function initialTheme(): SprintTheme {
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
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
