import {
  AnyBlock,
  ContentEditor,
  EditorActionCmd,
  EditorTarget,
  ID,
  SelectionRange,
} from "@content-editor/core";
import { EditablePlugin } from ".";

export type BlockMutationPluginOptions<TBlock extends AnyBlock> = {
  split: Split<TBlock>;

  merge: Merge<TBlock>;

  /**
   * Yields follow-up actions that get appended to a remove or split
   * action, letting callers keep dependent blocks in sync with the
   * structural change.
   */
  cascade?: Cascade<TBlock>;

  previous?: (
    block: TBlock,
    editor: ContentEditor<TBlock>,
  ) => { id: TBlock["id"]; childId?: ID } | null;
};

/**
 * Plugin that handles block-level mutations: deletion and splitting.
 *
 * | Key | Condition | Action |
 * |-----|-----------|--------|
 * | `Backspace` | Caret at position 0 | Merge with previous or delete empty block |
 * | `Enter` | Any position | Split block at caret position |
 */
export const useBlockMutationPlugin =
  <TBlock extends AnyBlock>({
    split,
    merge,
    cascade,
    previous = (block, editor) =>
      EditorTarget.tab({ id: block.id }, editor, -1),
  }: BlockMutationPluginOptions<TBlock>): EditablePlugin<TBlock> =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      const selectionBefore = SelectionRange.read(e.target as HTMLElement);
      if (!selectionBefore || e.defaultPrevented) return;

      if (
        e.key === "Backspace" &&
        // current selection is at the start of the block
        ((selectionBefore.start === 0 && selectionBefore.end === 0) ||
          // or the block only contains nbsp (is empty)
          e.currentTarget.textContent === String.fromCharCode(160))
      ) {
        const prev = previous(block, editor);
        const prevBlock =
          prev && editor.blocks.find((block) => block.id === prev.id);
        const prevElement = prevBlock && editor.ref(prevBlock.id).element;
        const currentBlock = editor.peek(block.id);

        if (!prevBlock || !prevElement || !currentBlock) return;

        const mergedBlock = merge(prevBlock, currentBlock);
        const tragetAfter = {
          id: prevBlock.id,
          childId: prev.childId,
          start: SelectionRange.maxOffset(prevElement),
          end: SelectionRange.maxOffset(prevElement),
        };

        if (!mergedBlock) return;

        const data = new useBlockMutationPlugin.MergeData();

        // merge any text on the tail of this block into the previous block
        editor.push({
          data,
          type: "apply",
          actions: [
            { type: "remove", block: currentBlock },
            { type: "update", block: mergedBlock },
            ...(cascade
              ? cascade({ type: "remove", block: currentBlock }, editor)
              : []),
          ],
          targetAfter: tragetAfter,
          targetBefore: { id: block.id, ...selectionBefore },
        });

        editor.commit(data);

        e.preventDefault();
      } else if (e.key === "Enter" && !e.shiftKey) {
        const currentBlock = editor.peek(block.id);

        if (!currentBlock) return;

        const offset = selectionBefore.start;
        const deleteRange = Math.max(
          0,
          selectionBefore.end - selectionBefore.start,
        );
        const splitBlocks = split(currentBlock, offset, deleteRange);

        if (!splitBlocks) return null;

        const data = new useBlockMutationPlugin.SplitData();

        editor.push({
          data,
          type: "apply",
          actions: [
            { type: "split", ...splitBlocks },
            ...(cascade
              ? cascade({ type: "split", ...splitBlocks }, editor)
              : []),
          ],
          targetBefore: { id: currentBlock.id, ...selectionBefore },
          targetAfter: { id: splitBlocks.right.id, start: 0, end: 0 },
        });
        editor.commit(data);

        e.preventDefault();
      }
    },
  });

useBlockMutationPlugin.MergeData = class BlockMutationMergeData {};

useBlockMutationPlugin.SplitData = class BlockMutationSplitData {};

export type Split<TBlock> = (
  block: TBlock,
  offset: number,
  deleteRange: number,
) => {
  left: TBlock;
  right: TBlock;
} | null;

export type Merge<TBlock> = (left: TBlock, right: TBlock) => TBlock | null;

export type Cascade<TBlock extends AnyBlock> = (
  action: Extract<EditorActionCmd<TBlock>, { type: "remove" | "split" }>,
  editor: ContentEditor<TBlock>,
) => EditorActionCmd<TBlock>[];
