import type { Meta, StoryObj } from "@storybook/react";
import { PlainTextEditor } from "./PlainTextEditor";
import source from "./PlainTextEditor.tsx?raw";

const meta: Meta<typeof PlainTextEditor> = {
  title: "Demo/PlainTextEditor",
  component: PlainTextEditor,
};

export default meta;

export const Default: StoryObj<typeof PlainTextEditor> = {
  parameters: {
    docs: { source: { code: source, language: "tsx" } },
  },
};
