import { SelectionRange } from "@ce/common/selection-range";
import { AnyEditorPlugin, EditorTarget } from "@ce/editor";
import { useRef } from "react";

/**
 * Auto commits changes after input, debounced by `debounceMs`.
 *
 * Schedules a commit on each input event and only commits if the editor
 * is still dirty when the debounce timer fires.
 */
export const useAutoCommitPlugin =
  (options?: { disabled?: boolean; debounceMs?: number }): AnyEditorPlugin =>
  (editor) => {
    const commitTimeoutRef = useRef<number>(null);

    const scheduleCommit = () => {
      if (options?.disabled) return;
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);

      const task = () => {
        const data = new useAutoCommitPlugin.EventData();

        editor.peek(EditorTarget.empty().id, data);

        if (!editor.hasUnsavedChanges) return;

        const selection = EditorTarget.read(editor);

        if (selection) {
          // if the current selection is known, restore it after update.
          // this overrides the selection restoration behaviour of the history plugin.
          editor.bus.addEventListener(
            "postcommit",
            () => {
              const { element } = editor.ref(selection.id);
              if (element) SelectionRange.apply(element, selection);
            },
            { once: true },
          );
        }

        editor.commit(data);
      };

      commitTimeoutRef.current = window.setTimeout(task, options?.debounceMs);
    };

    return () => ({
      onInput() {
        scheduleCommit();
      },
    });
  };

useAutoCommitPlugin.EventData = class AutoCommitEventData {
  constructor() {}
};
