import { EditorCommand, SelectionRange } from "@content-editor/core";
import { RichText } from "./model";

export function toggleAnnotation(
  annotation: "bold" | "italic" | "underline" | "strikethrough",
): EditorCommand<RichText> {
  return ({ block, data: selection }) => {
    if (!selection || SelectionRange.isCollapsed(selection)) return;
    return RichText.toggleAnnotations(
      block,
      { [annotation]: true },
      selection.start,
      selection.end,
    );
  };
}

export function setLink(url?: string): EditorCommand<RichText> {
  return ({ block, data: selection }) => {
    if (!selection || SelectionRange.isCollapsed(selection)) return;

    return RichText.map(
      block,
      (item) => ({ ...item, url }),
      selection.start,
      selection.end,
    );
  };
}

export const focusOnLink: EditorCommand<RichText> = ({ data: selection }) => {
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
