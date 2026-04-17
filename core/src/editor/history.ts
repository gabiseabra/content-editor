import { NonEmpty } from "@content-editor/utils/non-empty";
import { History } from "../utils/history.js";
import { AnyBlock } from "./index.js";
import { EditorTarget } from "./target.js";

/**
 * Commands for history tracking. Each command can be applied forward
 * to reconstruct state from a snapshot.
 */
export type EditorActionCmd<TBlock> =
  | { type: "update"; block: TBlock }
  | { type: "remove"; block: TBlock }
  | { type: "split"; left: TBlock; right: TBlock };

export interface EditorActionBatch<TBlock> {
  type: "apply";
  actions: NonEmpty<EditorActionCmd<TBlock>>;
}

export type EditorAction<TBlock> =
  | EditorActionBatch<TBlock>
  | EditorActionCmd<TBlock>;

export const EditorAction = {
  flat,

  map<A extends AnyBlock, B extends AnyBlock>(
    action: EditorAction<A>,
    f: (s: A) => B,
  ): EditorAction<B> {
    switch (action.type) {
      case "apply": {
        const actions = NonEmpty.merge(
          action.actions.map((cmd) =>
            EditorAction.flat([EditorAction.map(cmd, f)]),
          ),
        );

        return { ...action, actions };
      }
      case "split": {
        const left = f(action.left);
        const right = f(action.right);
        return { ...action, left, right };
      }
      default: {
        const block = f(action.block);
        return { ...action, block };
      }
    }
  },

  apply<TBlock extends AnyBlock>(
    cmd: EditorAction<TBlock>,
    blocks: TBlock[],
  ): TBlock[] {
    switch (cmd.type) {
      case "update":
        return blocks.map((b) => (b.id === cmd.block.id ? cmd.block : b));
      case "remove":
        return blocks.filter((b) => b.id !== cmd.block.id);
      case "split": {
        const index = blocks.findIndex((b) => b.id === cmd.left.id);
        if (index === -1) return blocks;
        const result = [...blocks];
        result.splice(index, 1, cmd.left, cmd.right);
        return result;
      }
      case "apply":
        return cmd.actions.reduce(
          (acc, cmd) => EditorAction.apply(cmd, acc),
          blocks,
        );
    }
  },
};

function flat<TBlock extends AnyBlock>(
  allCmds: NonEmpty<EditorAction<TBlock>>,
): NonEmpty<EditorActionCmd<TBlock>>;
function flat<TBlock extends AnyBlock>(
  allCmds: EditorAction<TBlock>[],
): EditorActionCmd<TBlock>[] {
  if (!NonEmpty.isNonEmpty(allCmds)) return [];
  const [cmd, ...cmds] = allCmds;
  return [
    ...(cmd.type === "apply" ? cmd.actions : [cmd]),
    ...(NonEmpty.isNonEmpty(cmds) ? EditorAction.flat(cmds) : []),
  ];
}

export type EditorHistoryEntry<TBlock extends AnyBlock> =
  EditorAction<TBlock> & {
    targetAfter: EditorTarget<TBlock>;
    targetBefore: EditorTarget<TBlock>;
  };

export class EditorHistory<TBlock extends AnyBlock> extends History<
  EditorHistoryEntry<TBlock>,
  TBlock[]
> {
  constructor(initialValue: TBlock[]) {
    super(initialValue, (blocks, cmd) => EditorAction.apply(cmd, blocks));
  }
}
