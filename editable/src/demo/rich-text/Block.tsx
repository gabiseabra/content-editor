import { HTMLAttributes, Ref } from "react";
import { RichTextBlock } from ".";
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
          __html:
            block.type === "text"
              ? block.text
                  .map(
                    (item) =>
                      `<span class="${Span.className(item)}">${escapeHtml(item.text)}</span>`,
                  )
                  .join("")
              : escapeHtml(block.code),
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
