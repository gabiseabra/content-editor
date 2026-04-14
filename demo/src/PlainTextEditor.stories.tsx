import type { Meta, StoryObj } from "@storybook/react";
import { PlainTextEditor } from "./PlainTextEditor";

const meta: Meta<typeof PlainTextEditor> = {
  title: "Demo/PlainTextEditor",
  component: () => <PlainTextEditor initialValue={["Hello"]} />,
};

export default meta;

export const Default: StoryObj<typeof PlainTextEditor> = {};
