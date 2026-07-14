import {
  AnyBlock,
  ContentEditor,
  EditorPlugin,
  SelectionRange,
  Slot,
  SpliceRange,
} from "@content-editor/core";
import { useLazyEditorChangeset } from "@content-editor/core/use-editor-changeset";
import { useEditorPlugins } from "@content-editor/core/use-editor-plugins";
import { useEventListenerPlugin } from "@content-editor/core/use-event-listener-plugin";
import { useRef } from "react";

/**
 * Plugin that handles text input for both contenteditable and input/textarea elements.
 *
 * Dispatches to one of two strategies based on the element type:
 * - `useControlledInlineMutationPlugin` — for `<input>` and `<textarea>` elements,
 *   when an `update` function is provided.
 * - `useLazyInlineMutationPlugin` — for contenteditable elements (or when no
 *   `update` function is provided).
 */
export const useInlineMutationPlugin = <TBlock extends AnyBlock>({
  debounceMs = 200,
  splice,
  update,
  disabled = () => false,
}: {
  debounceMs?: number | false;
  splice: Splice<TBlock>;
  /** If present, prefer reacting to onChange event when the target is a input
   * or textarea element */
  update?: Update<TBlock>;
  /** Disable event handlers. */
  disabled?: Slot<(data: SlotData<TBlock>) => boolean>;
}) => {
  const isMethodDisabled =
    (method: "update" | "splice"): Slot<(data: SlotData<TBlock>) => boolean> =>
    ({ id, editor }) =>
      !!update &&
      (editor.ref(id).element instanceof HTMLInputElement ||
      editor.ref(id).element instanceof HTMLTextAreaElement
        ? "update"
        : "splice") !== method;

  return useEditorPlugins(
    useLazyInlineMutationPlugin({
      splice,
      debounceMs,
      disabled: Slot.some([isMethodDisabled("splice"), disabled]),
    }),
    useEagerInlineMutationPlugin({
      update: update ?? ((b) => b),
      disabled: Slot.some([isMethodDisabled("update"), disabled]),
    }),
  );
};

/**
 * Plugin that handles text input for `<input>` and `<textarea>` elements.
 *
 * Reacts to the `onInput` event and replaces the block's content with the
 * element's full current value via the `update` callback.
 */
export const useEagerInlineMutationPlugin =
  <TBlock extends AnyBlock>({
    disabled,
    update,
    autoCommit = true,
  }: {
    disabled?: Slot<(data: SlotData<TBlock>) => boolean>;
    update: Update<TBlock>;
    autoCommit?: boolean;
  }): EditorPlugin<TBlock> =>
  (editor) => {
    const selectionBeforeRef = useRef<SelectionRange>(null);

    return (block) => ({
      onBeforeInput(event) {
        selectionBeforeRef.current = SelectionRange.read(event.currentTarget);
      },
      onInput(event) {
        if (
          Slot.extract(disabled, {
            id: block.id,
            editor,
            event: event.nativeEvent,
          })
        )
          return;

        editor.push({
          data: new useEagerInlineMutationPlugin.ChangeData(),
          type: "update",
          block: update(
            block,
            event.currentTarget instanceof HTMLInputElement ||
              event.currentTarget instanceof HTMLTextAreaElement
              ? event.currentTarget.value
              : (event.currentTarget.textContent ?? ""),
          ),
          targetBefore: {
            id: block.id,
            ...(selectionBeforeRef.current ?? { start: 0, end: 0 }),
          },
          targetAfter: {
            id: block.id,
            ...(SelectionRange.read(event.currentTarget) ?? {
              start: 0,
              end: 0,
            }),
          },
        });

        if (autoCommit) editor.commit();
      },
    });
  };

useEagerInlineMutationPlugin.ChangeData = class EagerInlineMutationPluginChangeData {};

/**
 * Plugin that handles text input via the native `beforeinput` in batched mode.
 *
 * This is appropriate for contenteditable elements,
 * where commits causes the whole inline stack to be thrashed,
 * and the element to lose selection.
 * For this reason, inline edits need to be batched.
 */
export const useLazyInlineMutationPlugin = <TBlock extends AnyBlock>({
  disabled,
  debounceMs = 200,
  splice,
}: {
  disabled?: Slot<(data: SlotData<TBlock>) => boolean>;
  debounceMs?: number | false;
  splice: Splice<TBlock>;
}): EditorPlugin<TBlock> =>
  useEventListenerPlugin("beforeinput", (editor) => {
    const changeset = useLazyEditorChangeset(editor, debounceMs);

    return (block) => (event) => {
      if (Slot.extract(disabled, { id: block.id, editor, event })) return;
      if (!(event.target instanceof HTMLElement)) return;

      const currentBlock = changeset.peek(block.id);
      const actualSelection = SelectionRange.read(event.target);

      if (!actualSelection || !currentBlock) return;

      const targetBefore = changeset.latest?.targetAfter ?? {
        id: block.id,
        ...actualSelection,
      };
      const spliceRange = SpliceRange.fromInputEvent(
        event,
        event.target.textContent ?? "",
        targetBefore,
      );

      if (!spliceRange) return;

      changeset.push({
        type: "update",
        block: splice(
          currentBlock,
          spliceRange.offset,
          spliceRange.deleteCount,
          spliceRange.insert,
        ),
        targetBefore: targetBefore,
        targetAfter: {
          id: block.id,
          ...SpliceRange.toSelectionRange(spliceRange, 1),
        },
      });
    };
  });

/** Applies a partial text mutation to a block by offset, delete count, and inserted string. */
export type Splice<TBlock> = (
  block: TBlock,
  offset: number,
  deleteCount: number,
  insert: string,
) => TBlock;

/** Replaces a block's content with a new full string value. */
export type Update<TBlock> = (block: TBlock, value: string) => TBlock;

type SlotData<TBlock extends AnyBlock> = {
  id: TBlock["id"];
  editor: ContentEditor<TBlock>;
  event: InputEvent;
};
