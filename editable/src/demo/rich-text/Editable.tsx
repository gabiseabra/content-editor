import { ContentEditableOptions, useContentEditablePlugin } from "@ce/editable";
import { useHotkeyPlugin } from "@ce/editable/use-hotkey-plugin";
import { ContentEditor } from "@ce/editor";
import { memo } from "react";
import { RichTextBlock } from ".";
import { useEditablePlugins } from "../../plugin";
import { Block } from "./Block";
import { toggleAnnotation } from "./command";

export const RichTextEditable = memo(function RichTextEditor({
  editor,
  ...options
}: ContentEditableOptions & {
  editor: ContentEditor<RichTextBlock>;
}) {
  const editable = useEditablePlugins(
    useHotkeyPlugin(`${ModKey}+b`, toggleAnnotation("bold")),
    useHotkeyPlugin(`${ModKey}+i`, toggleAnnotation("italic")),
    useHotkeyPlugin(`${ModKey}+u`, toggleAnnotation("underline")),
    useContentEditablePlugin(RichTextBlock, options),
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

const isMac = navigator.userAgent.match(/OS X 10/);
const ModKey = isMac ? "Meta" : "Ctrl";
