import { Traversal } from "@content-editor/utils/optics";
import { AnyBlock, ContentEditor } from "../editor";
import { EditorAction } from "../editor/history";
import { EditorTarget } from "../editor/target";
import { useEditorOptic } from "./use-editor-optic";

/**
 * Creates a derived `ContentEditor<TBlock>` scoped to child blocks embedded
 * inside a single parent block.
 *
 * All child mutations are wrapped as a parent `"update"` action — appropriate
 * when the child blocks live as fields of the parent.  For union-type
 * narrowing where child actions must pass through unchanged (split, remove),
 * use `useEditorPrism` instead.
 */
export function useEditorTraversal<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  id: parentId,
  editor,
  traversal,
}: {
  id: TParent["id"];
  editor: ContentEditor<TParent>;
  traversal: Traversal<TParent, TBlock>;
}): ContentEditor<TBlock> {
  return useEditorOptic({
    editor,
    parentId,
    project: (blocks) =>
      blocks.filter((b) => b.id === parentId).flatMap((b) => traversal.get(b)),
    lift: ({ targetBefore, targetAfter, ...action }) => {
      const idBefore = targetBefore?.id;
      const idAfter = targetAfter?.id;
      const parentBlock = editor.peek(parentId, true);
      if (!parentBlock) return null;
      return {
        type: "update",
        block: traversal.modify(
          parentBlock,
          (block) =>
            EditorAction.apply(action, [block]).find(
              (b) => b.id === block.id,
            ) ?? block,
        ),
        targetBefore: {
          ...(targetBefore ??
            EditorTarget.end({ id: parentId, childId: idBefore }, editor)),
          id: parentId,
          childId: idBefore,
        },
        targetAfter: {
          ...(targetAfter ??
            EditorTarget.end({ id: parentId, childId: idAfter }, editor)),
          id: parentId,
          childId: idAfter,
        },
      };
    },
  });
}
