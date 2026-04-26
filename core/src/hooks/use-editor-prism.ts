import { Prism } from "@content-editor/utils/optics";
import { AnyBlock, ContentEditor } from "../editor";
import { useEditorOptic } from "./use-editor-optic";

/**
 * Creates a derived `ContentEditor<TBlock>` that narrows a union-type parent
 * editor to a specific variant.
 *
 * Unlike `useEditorTraversal`, actions (split, remove, update) pass through to
 * the parent unchanged — valid because `TBlock extends TParent`.  This
 * preserves structural mutations like block splitting and removal at the
 * parent level.
 */
export function useEditorPrism<
  TParent extends AnyBlock,
  TBlock extends TParent,
>({
  id: parentId,
  editor,
  prism,
}: {
  id?: TParent["id"];
  editor: ContentEditor<TParent>;
  prism: Prism<TParent, TBlock>;
}): ContentEditor<TBlock> {
  return useEditorOptic({
    editor,
    parentId,
    project: (blocks) =>
      blocks.flatMap((b) => {
        const child = prism.get(b);
        return child !== undefined ? [child] : [];
      }),
    lift: (action) => action,
  });
}
