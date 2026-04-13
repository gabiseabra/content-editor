import { AnyBlock } from "../editor";
import { EditableProps, EditorPlugin } from "../editor/plugin";
import { unique } from "../utils/array";
import { keys } from "../utils/object";

/**
 * Composes multiple plugins into a single plugin.
 *
 * The resulting plugin's event map is the intersection of all input plugins' event maps.
 *
 * @note Event handlers follow a "first wins" model: handlers are called in order
 * until one calls `e.stopPropagation()`, which stops the chain. This means
 * earlier plugins in the composition have priority.
 */
export function useEditorPlugins<TBlock extends AnyBlock>(
  ...plugins: EditorPlugin<TBlock>[]
): EditorPlugin<TBlock> {
  return (editor) => {
    const appliedPlugins = plugins.map((p) => p(editor));

    return (block) => {
      const handlers = appliedPlugins.map((p) => p(block));

      const events = unique(handlers.flatMap((props) => keys(props)));

      return events.reduce<EditableProps>((props, key) => {
        props[key] = (e) => {
          for (const _props of handlers) {
            // ugh....
            (_props[key] as ((event: typeof e) => void) | undefined)?.(e);
            if (e.isPropagationStopped()) return;
          }
        };
        return props;
      }, {});
    };
  };
}
