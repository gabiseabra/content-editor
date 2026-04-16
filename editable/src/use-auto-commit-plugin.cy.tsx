import { SelectionRange } from "@content-editor/core";
import { RichTextEditor } from "./demo/rich-text/Editor";
import { p, span } from "./demo/rich-text/factory";

describe("useAutoCommitPlugin", () => {
  it("preserves focus when auto-commit fires while another block is active", () => {
    cy.mount(
      <RichTextEditor
        id="test"
        autoCommit={200}
        value={[p(1, span("Hello")), p(2, span("World"))]}
      />,
    );

    cy.get("p").eq(0).click().type("asdfg{downArrow}");
    cy.wait(202);

    cy.get("p").eq(1).should("have.focus");

    cy.get("p").eq(1).type("qwerty{upArrow}");
    cy.wait(202);

    cy.get("p").eq(0).should("have.focus");
  });

  it("preserves selection on auto-commit", () => {
    cy.mount(
      <RichTextEditor
        id="test"
        autoCommit={200}
        value={[p(1, span("Hello")), p(2, span("World"))]}
      />,
    );

    cy.get("p").eq(0).click().type("{leftArrow}{leftArrow}{leftArrow}y");
    cy.wait(202);

    cy.get("p")
      .eq(0)
      .should("have.text", "Heyllo")
      .then(([p]) => {
        expect(SelectionRange.read(p)).to.deep.equal({
          start: 3,
          end: 3,
        });
      });
  });
});
