import { ContentEditor } from "@content-editor/core";
import { useContentEditor } from "@content-editor/core/use-content-editor";
import { ContentEditableOptions } from "@content-editor/editable";
import { Ref, useImperativeHandle } from "react";
import { RichTextBlock } from "./Block";
import { RichText } from "./model";

export type RichTextEditor = ContentEditor<RichText>;

export function RichTextEditor({
  ref,
  id,
  value,
  onChange,
  ...options
}: ContentEditableOptions & {
  ref?: Ref<RichTextEditor>;
  id: string;
  value: RichText[];
  onChange?: (blocks: RichText[]) => void;
}) {
  const editor = useContentEditor({
    id,
    initialValue: value,
    onCommit: onChange,
  });

  useImperativeHandle(ref, () => editor, [editor]);

  return <RichTextBlock editor={editor} {...options} />;
}
