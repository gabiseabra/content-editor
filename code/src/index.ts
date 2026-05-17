import { AnyBlock } from "@content-editor/core";
import { EditablePlugin } from "@content-editor/editable";
import { useBlockNavigationPlugin } from "@content-editor/editable/use-block-navigation-plugin";
import { useEditablePluginStack } from "@content-editor/editable/use-editable-plugin-stack";
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
): EditablePlugin<TBlock> {
  return useEditablePluginStack(
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
