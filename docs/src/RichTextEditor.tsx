import { useContentEditor } from "@content-editor/core/use-content-editor";
import { useEditorPlugins } from "@content-editor/core/use-editor-plugins";
import {
  ContentEditableOptions,
  useContentEditablePlugin,
} from "@content-editor/editable";
import { useHotkeyPlugin } from "@content-editor/editable/use-hotkey-plugin";
import { memo } from "react";
import { Block } from "./chrome/Block";
import { RichTextBlock, toggleAnnotation } from "./utils/rich-text";

export const RichTextEditor = memo(function RichTextEditor(
  options: ContentEditableOptions & {
    initialValue: RichTextBlock[];
    onChange?: (blocks: RichTextBlock[]) => void;
  },
) {
  const editor = useContentEditor({
    id: "demo",
    initialValue: options.initialValue,
    onCommit: options.onChange,
  });
  const editable = useEditorPlugins(
    useHotkeyPlugin("Ctrl+b", toggleAnnotation("bold")),
    useHotkeyPlugin("Ctrl+i", toggleAnnotation("italic")),
    useHotkeyPlugin("Ctrl+u", toggleAnnotation("underline")),
    useContentEditablePlugin(RichTextBlock, { logging: true, ...options }),
  )(editor);

  return editor.blocks.map((block) => (
    <Block
      key={block.id}
      block={block}
      ref={editor.ref(block.id)}
      {...editable(block)}
    />
  ));
});
