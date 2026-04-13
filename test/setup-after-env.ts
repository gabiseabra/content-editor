import { expectSelectionRange } from "@content-editor/utils/test/expect-visual-selection";

expect.extend({
  ...expectSelectionRange,
});

const failOnCall =
  (method: string) =>
  (...args: unknown[]) => {
    throw new Error(`console.${method} called: ${args[0]}`);
  };

console.log = failOnCall("log");
console.warn = failOnCall("warn");
console.error = failOnCall("error");
