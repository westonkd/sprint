import type { ReactNode } from "react";
import { buttonGallery, buttonSpecimens } from "./Button.tsx";

export interface Specimens {
  gallery?: ReactNode;
  byExample: Record<string, ReactNode>;
}

const registry: Record<string, Specimens> = {
  Button: { gallery: buttonGallery, byExample: buttonSpecimens },
};

export function specimensFor(component: string): Specimens {
  return registry[component] ?? { byExample: {} };
}
