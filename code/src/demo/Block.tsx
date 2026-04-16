import { ContentEditor } from "@content-editor/core";
import { CSSProperties, memo, ReactNode, useRef } from "react";
import { useCodePlugin } from "..";
import { Code } from "./model";

type ForwardedProps = {
  id?: string;
  className?: string;
  style?: CSSProperties;
};

export type CodeBlockProps = {
  editor: ContentEditor<Code>;
  highlight: (code: string) => string | ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  onDelete?: () => void;

  pre?: ForwardedProps;
  code?: ForwardedProps;
  textarea?: ForwardedProps;
};

export const CodeBlock = memo(function CodeBlock({
  editor,
  highlight,
  readOnly,
  disabled,
  onDelete,

  pre,
  code,
  textarea,

  ...props
}: CodeBlockProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const editable = useCodePlugin(Code, { onDelete })(editor);

  const contentProps = (code: string) => {
    const html = highlight ? highlight(code) : code;
    if (typeof html === "string")
      return {
        dangerouslySetInnerHTML: { __html: html },
      };
    return { children: html };
  };

  return editor.blocks.map((block) => (
    <pre
      key={block.id}
      {...pre}
      style={{ position: "relative", ...pre?.style }}
    >
      <code
        ref={codeRef}
        {...code}
        {...(readOnly
          ? {
              ["aria-hidden"]: "true",
              style: {
                margin: 0,
                overflow: "hidden",
                ...code?.style,
              },
            }
          : {
              style: {
                position: "relative",
                zIndex: 1,
                pointerEvents: "none",
                ...code?.style,
              },
            })}
        {...contentProps(block.code)}
      />

      {!readOnly && (
        <textarea
          ref={editor.ref(block.id)}
          value={block.code}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          data-gramm={false}
          disabled={disabled}
          {...props}
          {...textarea}
          {...editable(block)}
          onScroll={(event) => {
            if (!codeRef.current) return;
            codeRef.current.scrollLeft = event.currentTarget.scrollLeft;
            codeRef.current.scrollTop = event.currentTarget.scrollTop;
          }}
          style={{
            border: 0,
            padding: 0,
            background: "none",
            boxSizing: "border-box",
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            resize: "none",
            color: "inherit",
            overflowY: "hidden",
            overflowX: "auto",
            pointerEvents: "all",
            MozOsxFontSmoothing: "grayscale",
            ...(!code
              ? {}
              : {
                  WebkitFontSmoothing: "antialiased",
                  WebkitTextFillColor: "transparent",
                }),
            ...textarea?.style,
          }}
        />
      )}
    </pre>
  ));
});
