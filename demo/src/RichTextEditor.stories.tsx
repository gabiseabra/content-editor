import type { Meta, StoryFn } from "@storybook/react";
import { RichTextEditor } from "./RichTextEditor";
import { p, span } from "./utils/rich-text";

const meta: Meta<typeof RichTextEditor> = {
  title: "Demo/RichTextEditor",
};

export default meta;

export const Default: StoryFn<typeof RichTextEditor> = function Default() {
  return (
    <RichTextEditor
      initialValue={[
        p(
          1,
          span("Hello, welcome to  "),
          span("my awesome ", { underline: true }),
          span("content editor ", { bold: true }),
          span("demo.", { italic: true }),
        ),
        p(2, span("Use keyboard shortcuts to toggle annotations.")),
      ]}
    />
  );
};
