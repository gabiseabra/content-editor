import { ContentEditableOptions } from "@ce/editable";
import { ContentEditor } from "@ce/editor";
import { useContentEditor } from "@ce/editor/use-content-editor";
import { Ref, useImperativeHandle } from "react";
import { RichTextBlock } from ".";
import { RichTextEditable } from "./Editable";

export type RichTextEditor = ContentEditor<RichTextBlock>;

export function RichTextEditor({
  ref,
  id,
  value,
  onChange,
  ...options
}: ContentEditableOptions & {
  ref?: Ref<RichTextEditor>;
  id: string;
  value: RichTextBlock[];
  onChange?: (blocks: RichTextBlock[]) => void;
}) {
  const editor = useContentEditor({
    id,
    initialValue: value,
    onCommit: onChange,
  });

  useImperativeHandle(ref, () => editor, [editor]);

  return <RichTextEditable editor={editor} {...options} />;
}
