import {
  AnyBlock,
  ContentEditor,
  EditorRef,
  SelectionRange,
} from "@content-editor/core";
import { AnyEditablePlugin } from ".";

/**
 * Plugin that enables arrow key navigation between blocks.
 *
 * | Key | Behavior |
 * |-----|----------|
 * | `ArrowLeft` | At start of block → move to end of previous block |
 * | `ArrowRight` | At end of block → move to start of next block |
 * | `ArrowUp` | Move to previous block, maintaining horizontal position |
 * | `ArrowDown` | Move to next block, maintaining horizontal position |
 */
export const useBlockNavigationPlugin: AnyEditablePlugin = (editor) => () => ({
  onKeyDown(event) {
    if (
      event.shiftKey ||
      !(
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      )
    )
      return;

    const selection = SelectionRange.read(event.currentTarget);

    if (!selection) return;

    const rootEditor = (() => {
      let e: ContentEditor<AnyBlock> = editor;
      while (e.parent) e = e.parent;
      return e;
    })();
    const allBlocks = EditorRef.read(rootEditor);
    const currentIndex = allBlocks.findIndex(
      (b) => b.element === event.currentTarget,
    );
    const prevElement = allBlocks[currentIndex - 1]?.element;
    const nextElement = allBlocks[currentIndex + 1]?.element;

    switch (event.key) {
      case "ArrowLeft":
        if (!(prevElement && selection.start === 0 && selection.end === 0))
          return;

        prevElement.focus();
        SelectionRange.apply(prevElement, {
          start: SelectionRange.maxOffset(prevElement),
          end: SelectionRange.maxOffset(prevElement),
        });

        event.preventDefault();
        event.stopPropagation();

        return;

      case "ArrowRight":
        if (
          !(
            nextElement &&
            selection.start === SelectionRange.maxOffset(event.currentTarget) &&
            SelectionRange.isCollapsed(selection)
          )
        )
          return;

        nextElement.focus();
        SelectionRange.apply(nextElement, { start: 0, end: 0 });

        event.preventDefault();
        event.stopPropagation();

        return;

      case "ArrowUp": {
        if (!prevElement) return;
        const range = SelectionRange.moveVertically(
          event.currentTarget,
          prevElement,
          1,
        );
        if (!range) return;

        prevElement.focus();
        SelectionRange.apply(prevElement, range);

        event.preventDefault();
        event.stopPropagation();

        return;
      }

      case "ArrowDown": {
        if (!nextElement) return;
        const range = SelectionRange.moveVertically(
          event.currentTarget,
          nextElement,
          -1,
        );
        if (!range) return;

        nextElement.focus();
        SelectionRange.apply(nextElement, range);

        event.preventDefault();
        event.stopPropagation();

        return;
      }
    }
  },
});
