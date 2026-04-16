import { useContentEditor } from "@content-editor/core/use-content-editor";
import { RichTextBlock } from "@content-editor/editable/demo/rich-text/Block";
import { p, span } from "@content-editor/editable/demo/rich-text/factory";
import type { Meta } from "@storybook/react";

const meta: Meta<typeof RichTextBlock> = {
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
  return <RichTextBlock editor={editor} />;
}
