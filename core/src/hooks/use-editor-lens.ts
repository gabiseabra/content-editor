import { Lens } from "@content-editor/utils/optics";
import { AnyBlock, ContentEditor } from "../editor";
import { EditorAction } from "../editor/history";
import { EditorTarget } from "../editor/target";
import { useEditorOptic } from "./use-editor-optic";

/**
 * Creates a derived `ContentEditor<TBlock>` scoped to a list of blocks
 * embedded inside a single parent block.
 *
 * All child mutations — including split and remove — are lifted as a
 * parent `"update"` action, making this suitable for any embedded
 * `TBlock[]` field regardless of structural changes.
 *
 * Use `useEditorPrism` instead when narrowing a union-type parent to
 * a variant — actions should pass through unchanged in that case.
 */
export function useEditorLens<
  TParent extends AnyBlock,
  TBlock extends AnyBlock,
>({
  id: parentId,
  editor,
  lens,
}: {
  id: TParent["id"];
  editor: ContentEditor<TParent>;
  lens: Lens<TParent, TBlock[]>;
}): ContentEditor<TBlock> {
  return useEditorOptic({
    editor,
    parentId,
    project: (blocks) =>
      blocks.filter((b) => b.id === parentId).flatMap((b) => lens.get(b)),
    lift: ({ targetBefore, targetAfter, ...action }) => {
      const parent = editor.peek(parentId, true);
      const idBefore = targetBefore?.id;
      const idAfter = targetAfter?.id;

      if (!parent) return null;

      return {
        type: "update",
        block: lens.set(parent, EditorAction.apply(action, lens.get(parent))),
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
