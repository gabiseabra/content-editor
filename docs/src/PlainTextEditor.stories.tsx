import { PlainTextEditor } from "@ce/editable/demo/plain-text/Editor";
import type { Meta } from "@storybook/react";

const meta: Meta<typeof PlainTextEditor> = {
  title: "Demo/PlainTextEditor",
};

export default meta;

export function Default() {
  return (
    <PlainTextEditor
      id="demo"
      value={[
        "Hello, welcome to my awesome plain-text content editor demo.",
        "Press Enter to split a paragraph, or Backspace at the start of a line to merge it with the previous one.",
      ]}
    />
  );
}
