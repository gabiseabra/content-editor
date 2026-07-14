import { RichTextEditable } from "@ce/editable/demo/rich-text/Editable";
import { p, span } from "@ce/editable/demo/rich-text/factory";
import { useContentEditor } from "@ce/editor/use-content-editor";
import type { Meta } from "@storybook/react";

const meta: Meta<typeof RichTextEditable> = {
  title: "Demo/RichTextEditor",
};

export default meta;

export function Default() {
  const editor = useContentEditor({
    id: "demo",
    initialValue: [
      p(
        1,
        span("Hello, welcome to "),
        span("my awesome ", { underline: true }),
        span("rich-text ", { bold: true }),
        span("content editor demo.", { italic: true }),
      ),
      p(2, span("Use keyboard shortcuts to toggle annotations.")),
    ],
  });
  return <RichTextEditable editor={editor} />;
}
