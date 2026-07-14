import { escapeHTML } from "@ce/common/escape-html";
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
                      `<span class="${Span.className(item)}">${escapeHTML(item.text)}</span>`,
                  )
                  .join("")
              : escapeHTML(block.code),
        }}
        {...props}
      />

      {children}
    </>
  );
}
