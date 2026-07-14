import { SelectionRange } from "@ce/common/selection-range";
import { EditorCommand } from "@ce/editor";
import { RichTextBlock } from ".";

export function toggleAnnotation(
  annotation: "bold" | "italic" | "underline" | "strikethrough",
): EditorCommand<RichTextBlock> {
  return ({ block, data: selection }) => {
    if (!selection || SelectionRange.isCollapsed(selection)) return;
    return RichTextBlock.toggleAnnotations(
      block,
      { [annotation]: true },
      selection.start,
      selection.end,
    );
  };
}

export function setBlockType(
  type: RichTextBlock["type"],
): EditorCommand<RichTextBlock> {
  return ({ block }) => {
    switch (type) {
      case "code":
        return {
          type: "code",
          id: block.id,
          code: RichTextBlock.toString(block),
        };
      case "text":
        return {
          type: "text",
          id: block.id,
          text: RichTextBlock.toArray(block),
        };
      default:
        return type satisfies never;
    }
  };
}

export function setLink(url?: string): EditorCommand<RichTextBlock> {
  return ({ block, data: selection }) => {
    if (
      !selection ||
      SelectionRange.isCollapsed(selection) ||
      block.type !== "text"
    )
      return;

    return RichTextBlock.mapRichText(
      block,
      (item) => ({ ...item, url }),
      selection.start,
      selection.end,
    );
  };
}

export const focusOnLink: EditorCommand<RichTextBlock> = ({
  data: selection,
}) => {
  if (!selection) return;

  // @todo expand the selection so that, if u selected a part of a link, it will cover the whole range of the link
  const linkRange = selection;
  const sel = document.getSelection();
  const element =
    sel?.getRangeAt(0)?.commonAncestorContainer.parentElement?.parentElement;

  if (
    linkRange &&
    element &&
    selection.start !== linkRange.start &&
    selection.end !== linkRange.end
  ) {
    SelectionRange.apply(element, linkRange);
  }
};
