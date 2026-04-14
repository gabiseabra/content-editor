import { HTMLAttributes, Ref } from "react";
import { RichTextBlock } from "../utils/rich-text";
import { Span } from "./Span";

export function Block({
  block,
  children,
  ...props
}: {
  ref: Ref<HTMLParagraphElement>;
  block: RichTextBlock;
} & HTMLAttributes<HTMLElement>) {
  return (
    <>
      <p
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{
          __html: block.text
            .map(
              (item) =>
                `<span class="${Span.className(item)}">${escapeHtml(item.text)}</span>`,
            )
            .join(""),
        }}
        {...props}
      />

      {children}
    </>
  );
}

const escapeHtml = (s: string) => {
  return new Option(s).innerHTML;
};
