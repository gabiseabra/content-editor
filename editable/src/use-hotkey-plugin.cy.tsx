import { SelectionRange } from "@content-editor/core";
import { RichTextEditor } from "./demo/rich-text/Editor";
import { p, span } from "./demo/rich-text/factory";

const ModKey = navigator.userAgent.match(/OS X 10/) ? "{meta}" : "{ctrl}";

describe("useHotkeyPlugin", () => {
  it("applies annotation to a word", () => {
    cy.mount(
      <RichTextEditor
        id="test"
        autoCommit={200}
        value={[p(1, span("Hello World"))]}
      />,
    );

    cy.get("p")
      .click()
      .then(([p]) => SelectionRange.apply(p, { start: 0, end: 5 }))
      .type(`${ModKey}b`);

    cy.get("p span.bold").should("have.text", "Hello");
  });

  it("toggles annotation off", () => {
    cy.mount(
      <RichTextEditor
        id="test"
        autoCommit={200}
        value={[p(1, span("Hello", { bold: true }), span(" World"))]}
      />,
    );

    cy.get("p span.bold").should("have.text", "Hello");

    cy.get("p")
      .click()
      .then(([p]) => SelectionRange.apply(p, { start: 0, end: 5 }))
      .type(`${ModKey}b`);

    cy.get("p span").should("have.length", 1).and("have.text", "Hello World");
  });
});
