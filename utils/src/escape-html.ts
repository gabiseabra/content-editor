export function escapeHTML(s: string) {
  const lookup: Record<string, string> = {
    "&": "&amp;",
    '"': "&quot;",
    "'": "&apos;",
    "<": "&lt;",
    ">": "&gt;",
  };
  return s.replace(/[&"'<>]/g, (c) => lookup[c] ?? c);
}
