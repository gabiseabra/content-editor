import { useContentEditor } from "@content-editor/core/use-content-editor";
import type { Meta } from "@storybook/react";
import { RichTextEditor } from "./RichTextEditor";
import { p, span } from "./utils/rich-text/factory";

const meta: Meta<typeof RichTextEditor> = {
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
  return <RichTextEditor editor={editor} />;
}
