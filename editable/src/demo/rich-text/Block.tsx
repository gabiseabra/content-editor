import { ContentEditor } from "@content-editor/core";
import { useEditorPlugins } from "@content-editor/core/use-editor-plugins";
import {
  ContentEditableOptions,
  useContentEditablePlugin,
} from "@content-editor/editable";
import { useHotkeyPlugin } from "@content-editor/editable/use-hotkey-plugin";
import { escapeHTML } from "@content-editor/utils/escape-html";
import { memo } from "react";
import { toggleAnnotation } from "./command";
import { RichText, RichTextItem } from "./model";
import { Span } from "./Span";

export const RichTextBlock = memo(function RichTextBlock({
  editor,
  filter,
  ...options
}: ContentEditableOptions & {
  editor: ContentEditor<RichText>;
  filter?: (block: RichText) => boolean;
}) {
  const editable = useEditorPlugins(
    useHotkeyPlugin(`${ModKey}+b`, toggleAnnotation("bold")),
    useHotkeyPlugin(`${ModKey}+i`, toggleAnnotation("italic")),
    useHotkeyPlugin(`${ModKey}+u`, toggleAnnotation("underline")),
    useContentEditablePlugin(RichText, options),
  )(editor);

  return (filter ? editor.blocks.filter(filter) : editor.blocks).map(
    (block) => {
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
    },
  );
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
