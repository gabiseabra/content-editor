import { Slot } from "@ce/common/slot";
import { AnyBlock } from "../editor";
import { AnyEditorPlugin, EditorPlugin } from "../editor/plugin";

/**
 * Composes multiple plugins into a single plugin.
 *
 * The resulting plugin's event map is the intersection of all input plugins' event maps.
 *
 * @note Event handlers follow a "first wins" model: handlers are called in order
 * until one calls `e.stopPropagation()`, which stops the chain. This means
 * earlier plugins in the composition have priority.
 */
export const useEditorPlugins =
  <TBlock extends AnyBlock, TProps>(
    plugins: (EditorPlugin<TBlock, TProps> | AnyEditorPlugin<TProps>)[],
    reducer: (
      acc: TProps,
      plugin: TProps,
      currentIndex: number,
      plugins: TProps[],
    ) => TProps,
    initialValue: Slot<(plugins: TProps[]) => TProps>,
  ): EditorPlugin<TBlock, TProps> =>
  (editor) => {
    const appliedPlugins = plugins.map((p) => p(editor));

    return (block) => {
      const ps = appliedPlugins.map((p) => p(block));
      return ps.reduce(reducer, Slot.extract(initialValue, ps));
    };
  };
