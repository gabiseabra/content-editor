import { AnyBlock, AnyEditorPlugin, ContentEditor } from "@content-editor/core";
import { useEditorPlugins } from "@content-editor/core/use-editor-plugins";
import { useEventListener } from "@content-editor/core/use-event-listener";
import { ANSI } from "@content-editor/utils/ansi";
import { SelectionRange } from "@content-editor/utils/selection-range";
import { KeyboardEvent } from "react";

/** Composed plugin that combines history restoration and undo/redo keyboard events. */
export const useHistoryPlugin = (options?: {
  /** When enabled, restores selection for child editors in addition to the main editor. */
  global?: boolean;
  disabled?: boolean;
  restoreDisabled?: boolean;
  undoDisabled?: boolean;
  redoDisabled?: boolean;
}): AnyEditorPlugin =>
  useEditorPlugins(
    useHistoryRestorationPlugin({
      global: options?.global,
      disabled: options?.restoreDisabled || options?.disabled,
    }),
    useHistoryEventsPlugin({
      disabled: options?.disabled,
      undoDisabled: options?.undoDisabled,
      redoDisabled: options?.redoDisabled,
    }),
  );

/** Plugin that handles undo (Cmd/Ctrl+Z) and redo (Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y) keyboard events. */
export const useHistoryEventsPlugin =
  (options?: {
    disabled?: boolean;
    undoDisabled?: boolean;
    redoDisabled?: boolean;
  }): AnyEditorPlugin =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      if (options?.disabled) return;

      const isMod = e.ctrlKey || e.metaKey;

      if (!isMod) return;

      if (!options?.undoDisabled && isUndo(e)) {
        const data = new useHistoryEventsPlugin.EventData("undo");
        e.preventDefault();

        if (editor.history.undo(true) && editor.peek(block.id, data)) {
          editor.history.undo();
          editor.commit(data);
          return;
        }
      }

      if (!options?.redoDisabled && isRedo(e)) {
        const data = new useHistoryEventsPlugin.EventData("redo");
        e.preventDefault();

        if (editor.history.redo(true) && editor.peek(block.id, data)) {
          editor.history.redo();
          editor.commit(data);
          return;
        }
      }
    },
  });

useHistoryEventsPlugin.EventData = class HistoryEventData {
  constructor(public action: "undo" | "redo") {}
};

/** Plugin that restores cursor selection to the correct position after an undo or redo. */
export const useHistoryRestorationPlugin =
  (options?: { global?: boolean; disabled?: boolean }): AnyEditorPlugin =>
  (editor) => {
    useEventListener(editor.bus, "ready", ({ editor }) => {
      if (!options?.disabled) restoreSelection(editor, options);
    });

    useEventListener(editor.bus, "postcommit", ({ editor }) => {
      if (!options?.disabled) restoreSelection(editor, options);
    });

    return () => ({});
  };

export function restoreSelection(
  editor: ContentEditor<AnyBlock>,
  options?: { global?: boolean },
) {
  const direction = editor.history.direction;

  if (!editor.currentAction) return;

  const { id, childId, ...selection } =
    direction === 1
      ? editor.currentAction.targetAfter
      : editor.currentAction.targetBefore;
  const element = childId
    ? editor.ref(id).children.get(childId)
    : editor.ref(id).element;
  const currentSelection = element && SelectionRange.read(element);

  if (childId && !options?.global) return;

  if (!element) {
    console.warn(
      [
        ANSI.warning(`[history-restoration]`),
        "Failed to restore selection:",
        "Element ref not found",
      ].join(" "),
      {
        id,
        childId,
        editor,
      },
    );
    return;
  }

  if (
    !selection ||
    (element === document.activeElement &&
      selection.start === currentSelection?.start &&
      selection.end === currentSelection?.end)
  )
    return;

  SelectionRange.apply(element, selection);
}

/** Utilities */

const isUndo = (e: KeyboardEvent) => e.key === "z" && !e.shiftKey;
const isRedo = (e: KeyboardEvent) =>
  (e.key === "z" && e.shiftKey) || e.key === "y";
