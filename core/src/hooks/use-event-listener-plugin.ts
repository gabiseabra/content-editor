import { useEffect } from "react";
import { AnyBlock } from "../editor";
import { EditorPlugin } from "../editor/plugin";
import { isNonNullable } from "../utils/non-nullable";

/**
 * Creates a plugin that attaches a native DOM event listener to all editor blocks.
 */
export function useEventListenerPlugin<
  TBlock extends AnyBlock,
  K extends keyof HTMLElementEventMap,
>(
  eventType: K,
  plugin: EditorPlugin<TBlock, (e: HTMLElementEventMap[K]) => void>,
): EditorPlugin<TBlock> {
  return (editor) => {
    const editable = plugin(editor);

    useEffect(() => {
      const blocks = editor.blocks
        .map((block) => {
          const { element } = editor.ref(block.id);
          return element && block ? { element, block } : null;
        })
        .filter(isNonNullable);

      return blocks.reduce<() => void>(
        (next, { element, block }) => {
          if (!element) return next;

          function listener(e: HTMLElementEventMap[K]) {
            editable(block)(e);
          }

          element?.addEventListener(eventType, listener);

          return () => {
            element?.removeEventListener(eventType, listener);
            next();
          };
        },
        () => {},
      );
    }, [editor]);

    return () => ({});
  };
}
