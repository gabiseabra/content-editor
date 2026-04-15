type ExportKind =
  | "type"
  | "const"
  | "function"
  | "class"
  | "interface"
  | "enum";

export function extractExport(
  source: string,
  kind: ExportKind,
  name: string,
): string {
  const keyword = kind === "function" ? "(?:async\\s+)?function" : kind;
  const pattern = new RegExp(`^export\\s+${keyword}\\s+${name}\\b`, "m");
  const match = pattern.exec(source);
  if (!match) throw new Error(`Export "${name}" not found in source`);

  // `type` and `const` declarations terminate at a top-level `;`.
  // Block-bodied declarations (function/class/interface/enum) terminate at
  // the matching top-level `}` of their body.
  const terminatesOnSemicolon = kind === "type" || kind === "const";

  const start = match.index;
  let i = start + match[0].length;
  let depth = 0;
  let seenBrace = false;
  let inString: '"' | "'" | "`" | null = null;

  while (i < source.length) {
    const ch = source[i]!;
    const prev = source[i - 1];

    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
    } else if (ch === "{" || ch === "(" || ch === "[") {
      depth++;
      if (ch === "{") seenBrace = true;
    } else if (ch === "}" || ch === ")" || ch === "]") {
      depth--;
      if (
        !terminatesOnSemicolon &&
        depth === 0 &&
        ch === "}" &&
        seenBrace
      ) {
        return source.slice(start, i + 1);
      }
    } else if (terminatesOnSemicolon && ch === ";" && depth === 0) {
      return source.slice(start, i + 1);
    }
    i++;
  }

  throw new Error(`Could not find end of export "${name}"`);
}
