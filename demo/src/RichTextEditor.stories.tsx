import type { Meta, StoryObj } from "@storybook/react";
import { RichTextEditor } from "./RichTextEditor";
import source from "./RichTextEditor.tsx?raw";

const meta: Meta<typeof RichTextEditor> = {
  title: "Demo/RichTextEditor",
  component: RichTextEditor,
};

export default meta;

export const Default: StoryObj<typeof RichTextEditor> = {
  parameters: {
    docs: { source: { code: source, language: "tsx" } },
  },
};
