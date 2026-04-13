import { useContentEditor } from "@content-editor/core/use-content-editor";
import { useContentEditablePlugin } from "@content-editor/editable";
import { memo } from "react";
import { PlainTextBlock } from "./utils/plain-text";

export const PlainTextEditor = memo(function PlainTextEditor() {
  const editor = useContentEditor<PlainTextBlock>({
    id: "demo",
    initialValue: [{ id: 1, text: "Hello" }],
  });
  const editable = useContentEditablePlugin(PlainTextBlock, {
    logging: true,
  })(editor);

  return editor.blocks.map((block) => (
    <p
      key={block.id}
      ref={editor.ref(block.id)}
      contentEditable
      suppressContentEditableWarning
      {...editable(block)}
    >
      {block.text}
    </p>
  ));
});
