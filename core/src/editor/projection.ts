import { Iso, Lens } from "@content-editor/utils/optics";
import { AnyBlock, ID } from ".";
import { EditorAction, EditorHistoryEntry } from "./history";

export type EditorProjection<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
> = {
  id: (id: ID) => ID;
  childId: () => ID | undefined;
  state: Lens<TParent[], TBlock[]>;
  action: (
    blocks: TParent[],
  ) => Iso<
    null | EditorHistoryEntry<TParent>,
    null | EditorHistoryEntry<TBlock>
  >;
};

export const EditorProjection = {
  fromGuard<TParent extends AnyBlock, TBlock extends TParent>(
    guard: (block: TParent) => block is TBlock,
  ): EditorProjection<TParent, TBlock> {
    return {
      id: (id) => id,
      childId: () => undefined,
      state: {
        get(parent) {
          return parent.flatMap((block) => (guard(block) ? [block] : []));
        },

        set(parent, blocks) {
          const existing = parent.flatMap((block) => {
            if (!guard(block)) return [block];
            const updated = blocks.find((b) => b.id === block.id);
            return updated ? [updated] : [];
          });
          const existingIds = existing.map((b) => b.id);
          const added = blocks.filter((b) => !existingIds.includes(b.id));

          return [...existing, ...added];
        },
      },

      action: () => ({
        view(action) {
          return action as EditorHistoryEntry<TBlock> | null;
        },

        review(action) {
          return action;
        },
      }),
    };
  },

  fromLens<TParent extends AnyBlock, TBlock extends AnyBlock>(
    parentId: TParent["id"],
    childId: TBlock["id"],
    lens: Lens<TParent, TBlock>,
  ): EditorProjection<TParent, TBlock> {
    type Projection = EditorProjection<TParent, TBlock>;
    const state: Projection["state"] = {
      get(parent) {
        const parentBlock = parent.find((b) => b.id === parentId);
        const block = parentBlock && lens.get(parentBlock);
        return block ? [block] : [];
      },

      set(parent, blocks) {
        const block = blocks.find((b) => b.id === childId);

        return parent.map((parentBlock) =>
          parentBlock.id === parentId && block
            ? lens.set(parentBlock, block)
            : parentBlock,
        );
      },
    };

    const action: Projection["action"] = (parentBlocks) => ({
      view(action) {
        const block = state.get(parentBlocks).find((b) => b.id === childId);
        if (!action || !block) return null;
        if (
          (action.type !== "update" && action.type !== "remove") ||
          action.block.id !== parentId
        ) {
          return {
            type: "update",
            id: childId,
            block,
            targetBefore: {
              id: childId,
              start: 0,
              end: 0,
            },
            targetAfter: {
              id: childId,
              start: 0,
              end: 0,
            },
          };
        }

        return {
          type: action.type,
          id: childId,
          block,
          targetBefore: {
            ...action.targetBefore,
            id: childId,
            childId: undefined,
          },
          targetAfter: {
            ...action.targetAfter,
            id: childId,
            childId: undefined,
          },
        };
      },

      review(action) {
        if (!action) return null;
        const parentBlock = state
          .set(
            parentBlocks,
            EditorAction.apply(action, state.get(parentBlocks)),
          )
          .find((b) => b.id === parentId);
        if (!parentBlock) return null;
        return {
          type: "update",
          id: parentId,
          block: parentBlock,
          targetBefore: {
            ...action.targetBefore,
            id: parentId,
            childId: childId,
          },
          targetAfter: {
            ...action.targetAfter,
            id: parentId,
            childId: childId,
          },
        };
      },
    });

    return {
      id: () => parentId,
      childId: () => childId,
      state,
      action,
    };
  },
};
