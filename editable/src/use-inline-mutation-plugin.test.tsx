/**
 * @jest-environment jsdom
 */
import { SelectionRange } from "@content-editor/core";
import { inputEvent } from "@content-editor/utils/test/input-event";
import { render } from "@testing-library/react";
import { act, RefObject } from "react";
import { RichTextBlock } from "./demo/rich-text";
import { RichTextEditor } from "./demo/rich-text/Editor";
import { p, span } from "./demo/rich-text/factory";

describe("useInlineMutationPlugin", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("handles typing from the middle", async () => {
    const editorRef: RefObject<RichTextEditor | null> = {
      current: null,
    };

    const { container } = render(
      <RichTextEditor
        id="test"
        autoCommit={200}
        ref={editorRef}
        value={[p(420, span("hey"))]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();
    expect(el.textContent).toBe("hey");

    SelectionRange.apply(el, { start: 3, end: 3 });
    inputEvent.delete(el, 1);
    inputEvent.insert(el, "llo");
    act(() => jest.advanceTimersByTime(1000));

    expect(RichTextBlock.toString(editorRef.current?.blocks[0]!)).toBe("hello");
    expect(el).toMatchVisualSelection("hello|");
  });

  it("handles typing in empty element", async () => {
    const editorRef: RefObject<RichTextEditor | null> = {
      current: null,
    };

    const { container } = render(
      <RichTextEditor
        id="test"
        autoCommit={200}
        ref={editorRef}
        value={[p(1)]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 0, end: 0 });
    inputEvent.insert(el, "XY");
    act(() => jest.advanceTimersByTime(1000));

    expect(RichTextBlock.toString(editorRef.current?.blocks[0]!)).toBe("XY");
    expect(el).toMatchVisualSelection("XY|");
  });

  it("adds newline on Shift+Enter", async () => {
    const editorRef: RefObject<RichTextEditor | null> = {
      current: null,
    };

    const { container } = render(
      <RichTextEditor
        id="test"
        autoCommit={200}
        ref={editorRef}
        value={[p(1, span("Hello"))]}
        onChange={() => {}}
      />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insertLine(el, 1);
    inputEvent.insert(el, "World");
    act(() => jest.advanceTimersByTime(1000));

    expect(RichTextBlock.toString(editorRef.current?.blocks[0]!)).toBe(
      "Hello\nWorld",
    );
    expect(el).toMatchVisualSelection("Hello\nWorld|");
  });
});
