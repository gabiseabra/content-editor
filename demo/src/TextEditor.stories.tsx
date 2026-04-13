import type { Meta, StoryObj } from "@storybook/react";
import { TextEditor } from "./TextEditor";
import source from "./TextEditor.tsx?raw";

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
