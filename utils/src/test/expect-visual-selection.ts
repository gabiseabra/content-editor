import { never } from "@content-editor/utils/error";
import { SelectionRange } from "@content-editor/utils/selection-range";
import type { MatcherFunction } from "expect";

const toMatchVisualSelection: MatcherFunction<[expected: string]> = function (
  actual,
  expected,
) {
  const candidate = parseMatcherInput(actual);
  const rendered = renderSelectionRange(candidate.text, candidate.selection);
  const pass = rendered === expected;

  return {
    pass,
    message: () =>
      pass
        ? `expected ${this.utils.printReceived(rendered)} not to equal ${this.utils.printExpected(expected)}`
        : `expected ${this.utils.printReceived(rendered)} to equal ${this.utils.printExpected(expected)}`,
  };
};

export const expectSelectionRange = {
  toMatchVisualSelection,
};

/** Internals */

function renderSelectionRange(text: string, selection: SelectionRange): string {
  const start = selection.start;
  const end = selection.end;

  if (SelectionRange.isCollapsed(selection)) {
    return `${text.slice(0, start)}|${text.slice(start)}`;
  }

  return `${text.slice(0, start)}[${text.slice(start, end)}]${text.slice(end)}`;
}

type MatcherInput = {
  text: string;
  selection: SelectionRange;
};
function parseMatcherInput(actual: unknown) {
  if (actual instanceof HTMLElement) {
    return {
      text: actual.textContent ?? "",
      selection:
        SelectionRange.read(actual) ??
        never("Expected element to have selection"),
    };
  }

  if (!isMatcherInput(actual))
    throw new TypeError(
      "toRenderSelectionAs expects HTMLElement | { text: string; selection: SelectionRange }",
    );

  return actual;
}
function isMatcherInput(actual: unknown): actual is MatcherInput {
  try {
    const {
      text,
      selection: { start, end },
    } = actual as any;
    if (
      !(
        typeof text === "string" &&
        typeof start === "number" &&
        typeof end === "number"
      )
    )
      throw null;
  } catch (error) {
    return false;
  }
  return true;
}

declare global {
  namespace jest {
    interface AsymmetricMatchers {
      toMatchVisualSelection(expected: string): void;
    }

    interface Matchers<R> {
      toMatchVisualSelection(expected: string): R;
    }
  }
}
