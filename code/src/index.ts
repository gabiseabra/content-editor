import { AnyBlock } from "@content-editor/core";
import { useEditorPlugins } from "@content-editor/core/use-editor-plugins";
import { useBlockNavigationPlugin } from "@content-editor/editable/use-block-navigation-plugin";
import { useHistoryPlugin } from "@content-editor/editable/use-history-plugin";
import {
  Splice,
  Update,
  useEagerInlineMutationPlugin,
} from "@content-editor/editable/use-inline-mutation-plugin";
import {
  createLogger,
  useLoggerPlugin,
} from "@content-editor/editable/use-logger-plugin";
import { useCodeDeletePlugin } from "./use-code-delete-plugin";
import { useCodeIndentPlugin } from "./use-code-indent-plugin";

export function useCodePlugin<TBlock extends AnyBlock>(
  strategy: {
    splice: Splice<TBlock>;
    update: Update<TBlock>;
  },
  options?: {
    tabCharacter?: string;
    logging?: boolean | "verbose";
    onDelete?: () => void;
  },
) {
  return useEditorPlugins(
    useEagerInlineMutationPlugin(strategy),
    useHistoryPlugin(),
    useCodeIndentPlugin({
      update: strategy.update,
      tabCharacter: options?.tabCharacter,
    }),
    useCodeDeletePlugin(options?.onDelete),
    useLoggerPlugin(createLogger(options?.logging)),
    useBlockNavigationPlugin,
  );
}
