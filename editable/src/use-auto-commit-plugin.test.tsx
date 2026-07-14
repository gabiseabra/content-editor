/**
 * @jest-environment jsdom
 */
import { SelectionRange } from "@ce/common/selection-range";
import { inputEvent } from "@ce/common/test/input-event";
import { render } from "@testing-library/react";
import { act } from "react";
import { RichTextEditor } from "./demo/rich-text/Editor";
import { p, span } from "./demo/rich-text/factory";

describe("useAutoCommitPlugin", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("commits after debounce when input occurs", () => {
    const onChange = jest.fn();

    const { container } = render(
      <RichTextEditor
        id="test"
        autoCommit={200}
        value={[p(1, span("Hello"))]}
        onChange={onChange}
      />,
    );

    const el = container.querySelector("p")!;
    expect(el).toBeTruthy();

    SelectionRange.apply(el, { start: 5, end: 5 });
    inputEvent.insert(el, " World");

    expect(onChange).toHaveBeenCalledTimes(0);

    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(onChange).toHaveBeenCalledTimes(0);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
