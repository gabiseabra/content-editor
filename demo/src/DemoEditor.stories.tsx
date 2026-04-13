import type { Meta, StoryObj } from "@storybook/react";
import { DemoEditor } from "./DemoEditor";
import source from "./DemoEditor.tsx?raw";

const meta: Meta<typeof DemoEditor> = {
  title: "Demo/Editor",
  component: DemoEditor,
};

export default meta;

export const Default: StoryObj<typeof DemoEditor> = {
  parameters: {
    docs: { source: { code: source, language: "tsx" } },
  },
};
