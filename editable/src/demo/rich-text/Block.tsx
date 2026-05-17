import { ContentEditor } from "@content-editor/core";
import {
  EditablePluginOptions,
  useEditablePlugin,
} from "@content-editor/editable/use-editable-plugin";
import { useEditablePluginStack } from "@content-editor/editable/use-editable-plugin-stack";
import { useHotkeyPlugin } from "@content-editor/editable/use-hotkey-plugin";
import { escapeHTML } from "@content-editor/utils/escape-html";
import { memo } from "react";
import { toggleAnnotation } from "./command";
import { RichText, RichTextItem } from "./model";
import { Span } from "./Span";

export const RichTextBlock = memo(function RichTextBlock({
  editor,
  ...options
}: EditablePluginOptions & {
  editor: ContentEditor<RichText>;
}) {
  const editable = useEditablePluginStack(
    useHotkeyPlugin(`${ModKey}+b`, toggleAnnotation("bold")),
    useHotkeyPlugin(`${ModKey}+i`, toggleAnnotation("italic")),
    useHotkeyPlugin(`${ModKey}+u`, toggleAnnotation("underline")),
    useEditablePlugin(RichText, options),
  )(editor);

  return editor.blocks.map((block) => {
    const props = {
      ref: editor.ref(block.id),
      ...contentProps(block.text),
      ...editable(block),
    };

    switch (block.type) {
      case "heading":
        return <h1 key={block.id} {...props} />;
      case "subheading":
        return <h2 key={block.id} {...props} />;
      case "text":
        return <p key={block.id} {...props} />;
      default:
        return block satisfies never;
    }
  });
});

const isMac = navigator.userAgent.match(/OS X 10/);
const ModKey = isMac ? "Meta" : "Ctrl";

const contentProps = (text: RichTextItem[]) => ({
  className: "sb-unstyled",
  contentEditable: "plaintext-only" as const,
  suppressContentEditableWarning: true,
  dangerouslySetInnerHTML: {
    __html: text
      .map(
        (item) =>
          `<span class="${Span.className(item)}">${escapeHTML(item.text)}</span>`,
      )
      .join(""),
  },
});
