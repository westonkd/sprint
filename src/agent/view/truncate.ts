export const TRUNCATION_MARKER = "\n… truncated";

export function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  if (max <= TRUNCATION_MARKER.length) return text.slice(0, max);

  const budget = max - TRUNCATION_MARKER.length;
  const head = text.slice(0, budget);
  const boundary = head.lastIndexOf("\n");
  const cut = boundary > budget / 2 ? head.slice(0, boundary) : head.trimEnd();

  return `${cut}${TRUNCATION_MARKER}`;
}

export function paginate(text: string, size: number): string[] {
  if (size <= 0) return [text];

  const lines = text.split("\n");
  const pages: string[] = [];
  let current = "";

  for (const line of lines) {
    const candidate = current === "" ? line : `${current}\n${line}`;
    if (candidate.length <= size) {
      current = candidate;
      continue;
    }
    if (current !== "") pages.push(current);
    current = line.length <= size ? line : "";
    if (line.length > size) {
      for (let index = 0; index < line.length; index += size) {
        pages.push(line.slice(index, index + size));
      }
    }
  }

  if (current !== "") pages.push(current);
  return pages.length === 0 ? [""] : pages;
}
