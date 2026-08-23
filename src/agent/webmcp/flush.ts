import { flushSync } from "react-dom";

export function commitSync(action: () => void): void {
  flushSync(action);
}
