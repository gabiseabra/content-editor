import { ContentEditor } from "@content-editor/core";
import { useContentEditor } from "@content-editor/core/use-content-editor";
import { useContentEditablePlugin } from "@content-editor/editable";
import { memo } from "react";
import { PlainText } from "./model";

export type PlainTextEditor = ContentEditor<PlainText>;

/**
 * This editor is lazy: it does not update the DOM unless you trigger a commit.
 * This is what ensures smooth typing in contentEditable elements, as updating
 * on every keystroke would always reset the current selection.
 * Wrapping the component in `memo` is recommended, since it keeps parent
 * re-renders from wiping the selection.
 * @note that you have to pass stable props for this to work ! ! !
 * @see the next editor for a better pattern.
 */
export const PlainTextEditor = memo(function PlainTextEditor(options: {
  id: string;
  value: string[];
}) {
  const editor = useContentEditor({
    id: options.id,
    initialValue: options.value.map((text, id) => ({ id, text })),
  });
  const editable = useContentEditablePlugin(PlainText, {
    logging: true,
  })(editor);

  return editor.blocks.map((block) => (
    <p
      key={block.id}
      contentEditable
      suppressContentEditableWarning
      className="sb-unstyled"
      ref={editor.ref(block.id)}
      {...editable(block)}
    >
      {block.text}
    </p>
  ));
});
