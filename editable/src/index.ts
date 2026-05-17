import { AnyBlock, ContentEditor, EditorPlugin } from "@content-editor/core";
import { HTMLAttributes } from "react";
import { Cascade, Merge, Split } from "./use-block-mutation-plugin";
import { Splice, Update } from "./use-inline-mutation-plugin";

export type { Cascade, Merge, Splice, Split, Update };

type ReactEventHandlers<T> = {
  [K in keyof T as K extends `on${string}` ? K : never]: T[K];
};

/**
 * Any React event handler prop that a plugin can attach to a block’s editable
 * DOM element. These props are composed and spread onto that element.
 */
export type EditableProps = ReactEventHandlers<HTMLAttributes<HTMLElement>>;

/**
 * A plugin that extends the content editor's behavior.
 *
 * Plugins are curried functions following a two-phase pattern:
 * 1. **Editor phase**: Receives the editor instance, can use React hooks
 * 2. **Block phase**: Receives a block, returns DOM props for that block
 */
export type EditablePlugin<TBlock extends AnyBlock> = EditorPlugin<
  TBlock,
  EditableProps
>;

/** EditorPlugin that works for all types of blocks */
export type AnyEditablePlugin<TProps = EditableProps> = <
  TBlock extends AnyBlock,
>(
  editor: ContentEditor<TBlock>,
) => (block: TBlock) => TProps;
