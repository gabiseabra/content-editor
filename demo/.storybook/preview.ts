import type { Preview } from "@storybook/react";
import "./styles/index.scss";

const preview: Preview = {
  parameters: {
    docs: {
      codePanel: true,
    },
    actions: { disable: true },
  },
};

export default preview;
