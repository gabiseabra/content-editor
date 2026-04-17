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
import { RichText } from "./model";
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
    (block) => (
      <p
        key={block.id}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{
          __html: block.text
            .map(
              (item) =>
                `<span class="${Span.className(item)}">${escapeHTML(item.text)}</span>`,
            )
            .join(""),
        }}
        className="sb-unstyled"
        ref={editor.ref(block.id)}
        {...editable(block)}
      />
    ),
  );
});

const isMac = navigator.userAgent.match(/OS X 10/);
const ModKey = isMac ? "Meta" : "Ctrl";
