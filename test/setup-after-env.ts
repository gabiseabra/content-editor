import { expectSelectionRange } from "@content-editor/utils/test/expect-visual-selection";

expect.extend({
  ...expectSelectionRange,
});

const failOnCall =
  (method: string) =>
  (...args: unknown[]) => {
    throw new Error(
      `console.${method} called: ${args.map((arg) => JSON.stringify(arg, null, 2)).join(", ")}`,
    );
  };

console.log = failOnCall("log");
console.warn = failOnCall("warn");
console.error = failOnCall("error");
