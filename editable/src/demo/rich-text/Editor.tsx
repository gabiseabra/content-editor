import { ContentEditor } from "@content-editor/core";
import { useContentEditor } from "@content-editor/core/use-content-editor";
import { ContentEditableOptions } from "@content-editor/editable";
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
