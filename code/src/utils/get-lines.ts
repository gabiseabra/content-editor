export function* getLines(code: string, start: number, end: number) {
  const selection = { start: 0, end: 0 };

  for (const line of code.split("\n")) {
    selection.end += line.length + 1;

    if (selection.end < start) {
      selection.start += line.length + 1;
    } else {
      yield line;
    }

    if (selection.end >= end) break;
  }

  return selection;
}
