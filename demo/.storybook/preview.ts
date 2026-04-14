import type { Preview } from "@storybook/react";
import estree from "prettier/plugins/estree";
import typescript from "prettier/plugins/typescript";
import * as prettier from "prettier/standalone";
import { addons } from "storybook/preview-api";
import "./styles/index.scss";

const SNIPPET_RENDERED = "storybook/docs/snippet-rendered";
const channel = addons.getChannel();

async function format(code: string) {
  try {
    return (
      await prettier.format(code, {
        parser: "typescript",
        plugins: [estree, typescript],
        tabWidth: 2,
        objectWrap: "collapse",
      })
    ).trimEnd();
  } catch {
    return code;
  }
}

const preview: Preview = {
  parameters: {
    actions: { disable: true },
    docs: { codePanel: true },
  },
  decorators: [
    (Story, context) => {
      const original = context.parameters?.docs?.source?.originalSource;
      if (original) {
        format(original).then((source) => {
          channel.emit(SNIPPET_RENDERED, {
            id: context.id,
            source,
            args: context.unmappedArgs,
          });
        });
      }
      return Story();
    },
  ],
};

export default preview;
