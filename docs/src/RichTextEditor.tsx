import { ContentEditor } from "@content-editor/core";
import { useEditorPlugins } from "@content-editor/core/use-editor-plugins";
import {
  ContentEditableOptions,
  useContentEditablePlugin,
} from "@content-editor/editable";
import { useHotkeyPlugin } from "@content-editor/editable/use-hotkey-plugin";
import { memo } from "react";
import { Block } from "./chrome/Block";
import { RichTextBlock } from "./utils/rich-text";
import { toggleAnnotation } from "./utils/rich-text/command";

export const RichTextEditor = memo(function RichTextEditor({
  editor,
  ...options
}: ContentEditableOptions & {
  editor: ContentEditor<RichTextBlock>;
}) {
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
