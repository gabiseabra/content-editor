import { AnyEditablePlugin } from "@content-editor/editable";

export const useCodeDeletePlugin =
  (onDelete?: () => void): AnyEditablePlugin =>
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
