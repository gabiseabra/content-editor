import { unique } from "@ce/common/array";
import { createRecord, keys } from "@ce/common/object";
import { AnyBlock, AnyEditorPlugin, EditorPlugin } from "@ce/editor";
import { useEditorPlugins } from "@ce/editor/use-editor-plugins";
import { EventHandler, HTMLAttributes, SyntheticEvent } from "react";

type ReactEventHandlers<T> = {
  [K in keyof T as K extends `on${string}` ? K : never]: T[K];
};

type ComposedHandler = EventHandler<SyntheticEvent<HTMLElement>>;

/**
 * Any React event handler prop that a plugin can attach to a block’s editable
 * DOM element. These props are composed and spread onto that element.
 */
export type EditableProps = ReactEventHandlers<HTMLAttributes<HTMLElement>>;

export type EditablePlugin<TBlock extends AnyBlock> = EditorPlugin<
  TBlock,
  EditableProps
>;

export type AnyEditablePlugin = AnyEditorPlugin<EditableProps>;

export function useEditablePlugins<TBlock extends AnyBlock>(
  ...plugins: EditablePlugin<TBlock>[]
) {
  return useEditorPlugins(
    plugins,
    (acc, a) => {
      keys(a).forEach((k) => {
        const f: ComposedHandler | undefined = acc[k];
        const g: ComposedHandler | undefined = a[k];
        const fg: ComposedHandler = (e) => {
          f?.(e);
          if (e.isPropagationStopped()) return;
          g?.(e);
        };
        acc[k] = fg;
      });
      return acc;
    },
    (handlers) => createRecord(unique(handlers.flatMap(keys)), () => () => {}),
  );
}
