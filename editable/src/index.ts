import { AnyBlock } from "@content-editor/core";
import { useEditorPlugins } from "@content-editor/core/use-editor-plugins";
import { useAutoCommitPlugin } from "./use-auto-commit-plugin";
import {
  Cascade,
  Merge,
  Split,
  useBlockMutationPlugin,
} from "./use-block-mutation-plugin";
import { useBlockNavigationPlugin } from "./use-block-navigation-plugin";
import { useHistoryPlugin } from "./use-history-plugin";
import {
  Splice,
  Update,
  useInlineMutationPlugin,
} from "./use-inline-mutation-plugin";
import { createLogger, useLoggerPlugin } from "./use-logger-plugin";

export type ContentEditableOptions = {
  inline?: boolean;
  logging?: boolean | "verbose";
  autoCommit?: boolean | number;
};

export function useContentEditablePlugin<TBlock extends AnyBlock>(
  strategy: {
    splice: Splice<TBlock>;
    update?: Update<TBlock>;
    merge: Merge<TBlock>;
    split: Split<TBlock>;
    cascade?: Cascade<TBlock>;
  },
  options?: ContentEditableOptions,
) {
  return useEditorPlugins(
    useInlineMutationPlugin(strategy),
    useBlockMutationPlugin(strategy),
    useBlockNavigationPlugin,
    useHistoryPlugin(),
    useAutoCommitPlugin({
      disabled:
        options?.autoCommit === false ||
        typeof options?.autoCommit === "undefined",
      debounceMs:
        typeof options?.autoCommit === "number"
          ? options.autoCommit
          : undefined,
    }),
    useLoggerPlugin(createLogger(options?.logging)),
  );
}
