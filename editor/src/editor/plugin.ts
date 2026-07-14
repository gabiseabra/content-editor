import { AnyBlock, ContentEditor } from "./index";

/**
 * A plugin that extends the content editor's behavior.
 *
 * Plugins are curried functions following a two-phase pattern:
 * 1. **Editor phase**: Receives the editor instance, can use React hooks
 * 2. **Block phase**: Receives a block, returns DOM props for that block
 */
export type EditorPlugin<TBlock extends AnyBlock, TProps> = (
  editor: ContentEditor<TBlock>,
) => (block: TBlock) => TProps;

/** EditorPlugin that works for all types of blocks */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEditorPlugin<TProps> = <TBlock extends AnyBlock>(
  editor: ContentEditor<TBlock>,
) => (block: TBlock) => TProps;
