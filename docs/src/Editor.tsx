import { useContentEditor } from "@content-editor/core/use-content-editor";
import { ContentEditableOptions } from "@content-editor/editable";
import { RichTextEditor } from "./RichTextEditor";
import { RichTextBlock } from "./utils/rich-text";

/**
 * For use in MDX
 */
export function Editor({
  id,
  value,
  onChange,
  ...options
}: ContentEditableOptions & {
  id: string;
  value: RichTextBlock[];
  onChange?: (blocks: RichTextBlock[]) => void;
}) {
  const editor = useContentEditor({
    id,
    initialValue: value,
    onCommit: onChange,
  });

  return <RichTextEditor editor={editor} {...options} />;
}
