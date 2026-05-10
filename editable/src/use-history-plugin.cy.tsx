import { SelectionRange } from "@content-editor/core";
import { RichTextEditor } from "./demo/rich-text/Editor";
import { p, span } from "./demo/rich-text/factory";

describe("useHistoryPlugin", () => {
  it("undoes and redoes typed edits across blocks", () => {
    cy.mount(
      <RichTextEditor
        id="test"
        autoCommit={200}
        value={[p(1, span("Initial state 123"))]}
      />,
    );

    // Delete initial text
    cy.get("p").click().type("{selectAll}{del}");
    cy.wait(200);

    // Write something & wait for commit
    cy.get("p").type("Hello world");
    cy.wait(200);

    // Write something & wait for commit 3 more times
    for (let n = 0; n < 3; n++) {
      cy.get("p").click().type(" .");
      cy.wait(200);
    }

    // Add a newline, write something into it, wait for commit (should be two commits)
    cy.get("p").click().type("\nJust adding a newline");
    cy.wait(200);

    cy.get("p").eq(0).should("contain.text", "Hello world . . .");
    cy.get("p").eq(1).should("contain.text", "Just adding a newline");
    cy.wait(200);

    cy.get("p").eq(1).type("{ctrl}z").type("{ctrl}z").should("not.exist");
    cy.get("p")
      .eq(0)
      .should("have.focus")
      .type("{ctrl}z") // .
      .type("{ctrl}z") // .
      .type("{ctrl}z") // .
      .type("{ctrl}z") // Hello world
      .type("{ctrl}z") // Delete
      .should("contain.text", "Initial state 123");

    cy.get("p")
      .eq(0)
      .type("{ctrl}y")
      .type("{ctrl}y")
      .type("{ctrl}y")
      .type("{ctrl}y")
      .type("{ctrl}y")
      .should("contain.text", "Hello world . . .")
      .type("{ctrl}y")
      .type("{ctrl}y");

    cy.get("p")
      .eq(1)
      .should("have.focus")
      .should("contain.text", "Just adding a newline");
  });

  it("restores cursor position on undo / redo", () => {
    cy.mount(
      <RichTextEditor
        id="test"
        autoCommit={200}
        value={[p(1, span("Hello World"))]}
      />,
    );

    // ctrl + backspace triggers deleteWorkBackwards but doesn't actually delete
    // the word backward in electron?
    // cy.get("p").type("{moveToEnd}").type("{ctrl}{backspace}");
    cy.get("p").type("{moveToEnd}").type(Cypress._.repeat("{backspace}", 5));
    cy.wait(200);

    cy.get("p")
      .then(([p]) => {
        expect(SelectionRange.read(p)).to.deep.equal({
          start: 6,
          end: 6,
        });
      })
      .type("{ctrl}z")
      .then(([p]) => {
        expect(SelectionRange.read(p)).to.deep.equal({
          start: 11,
          end: 11,
        });
      })
      .type("{ctrl}y")
      .then(([p]) => {
        expect(SelectionRange.read(p)).to.deep.equal({
          start: 6,
          end: 6,
        });
      });
  });

  it("restores selection to the current block when undoing typed text after multiple splits", () => {
    cy.mount(
      <RichTextEditor id="test" autoCommit={200} value={[p(1, span(""))]} />,
    );

    cy.get("p").click().type("abc{enter}");
    cy.get("p").eq(1).should("have.focus").type("123{enter}");
    cy.get("p").eq(2).should("have.focus").type("xyz{ctrl}z");

    cy.get("p").should("have.length", 3);
    cy.get("p").eq(0).should("have.text", "abc");
    cy.get("p").eq(1).should("have.text", "123");
    cy.get("p").eq(2).should("have.text", "");
    cy.get("p")
      .eq(2)
      .should("have.focus")
      .then(([p]) => {
        expect(SelectionRange.read(p)).to.deep.equal({ start: 0, end: 0 });
      });
  });

  it("restores selection to the next block on split", () => {
    cy.mount(
      <RichTextEditor id="test" autoCommit={200} value={[p(1, span(""))]} />,
    );

    cy.get("p").click().type("abc{enter}");

    cy.get("p").should("have.length", 2);
    cy.get("p").eq(0).should("have.text", "abc");
    cy.get("p").eq(1).should("have.text", "").should("have.focus");
  });
});
