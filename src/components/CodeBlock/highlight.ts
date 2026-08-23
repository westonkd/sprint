export type TokenKind =
  | "plain"
  | "tag"
  | "attr"
  | "string"
  | "keyword"
  | "number"
  | "punct"
  | "comment";

export interface Token {
  kind: TokenKind;
  text: string;
}

const PATTERN =
  /(\/\/[^\n]*)|("[^"]*"|'[^']*'|`[^`]*`)|(<\/?[A-Za-z][\w.-]*)|([\w-]+(?==))|(\b(?:const|let|var|function|return|import|export|from|await|async|new|true|false|null|undefined)\b)|(\b\d+(?:\.\d+)?\b)|([<>/{}()[\];=,.]+)/g;

const KINDS: readonly TokenKind[] = [
  "comment",
  "string",
  "tag",
  "attr",
  "keyword",
  "number",
  "punct",
];

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of code.matchAll(PATTERN)) {
    const index = match.index;
    if (index === undefined) continue;

    if (index > cursor) {
      tokens.push({ kind: "plain", text: code.slice(cursor, index) });
    }

    const kind = KINDS.find((_, slot) => match[slot + 1] !== undefined) ?? "plain";
    tokens.push({ kind, text: match[0] });
    cursor = index + match[0].length;
  }

  if (cursor < code.length) {
    tokens.push({ kind: "plain", text: code.slice(cursor) });
  }

  return tokens;
}
