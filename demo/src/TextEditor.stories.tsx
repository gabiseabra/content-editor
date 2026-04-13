import type { Meta, StoryObj } from "@storybook/react";
import source from "./DemoEditor.tsx?raw";
import { TextEditor } from "./TextEditor";

const meta: Meta<typeof TextEditor> = {
  title: "Demo/TextEditor",
  component: TextEditor,
};

export default meta;

export const Default: StoryObj<typeof TextEditor> = {
  parameters: {
    docs: { source: { code: source, language: "tsx" } },
  },
};
