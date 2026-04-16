import { AnyEditorPlugin } from "@content-editor/core";

export const useCodeDeletePlugin =
  (onDelete?: () => void): AnyEditorPlugin =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      if (
        e.key === "Backspace" &&
        editor.ref(block.id).element?.textContent === ""
      ) {
        e.preventDefault();
        onDelete?.();
      }
    },
  });
