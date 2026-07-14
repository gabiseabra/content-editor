/**
 * @jest-environment jsdom
 */
import { SelectionRange } from "@ce/common/selection-range";
import { fireEvent, render } from "@testing-library/react";
import { RichTextEditor } from "./demo/rich-text/Editor";
import { p, span } from "./demo/rich-text/factory";

describe("useBlockNavigationPlugin", () => {
  it("moves caret to next block on ArrowRight at end", () => {
    const { container } = render(
      <RichTextEditor
        id="test"
        value={[p(1, span("First")), p(2, span("Second"))]}
      />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();

    SelectionRange.apply(first, {
      start: SelectionRange.maxOffset(first),
      end: SelectionRange.maxOffset(first),
    });

    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(SelectionRange.read(second)).toEqual({
      start: 0,
      end: 0,
    });
    expect(SelectionRange.read(first)).toBeNull();
  });

  it("moves caret to previous block on ArrowLeft at start", () => {
    const { container } = render(
      <RichTextEditor
        id="test"
        value={[p(1, span("First")), p(2, span("Second"))]}
      />,
    );

    const [first, second] = Array.from(container.querySelectorAll("p"));

    SelectionRange.apply(second, { start: 0, end: 0 });

    fireEvent.keyDown(second, { key: "ArrowLeft" });

    const range = SelectionRange.read(first);
    expect(range).toEqual({
      start: SelectionRange.maxOffset(first),
      end: SelectionRange.maxOffset(first),
    });
    expect(SelectionRange.read(second)).toBeNull();
  });
});
