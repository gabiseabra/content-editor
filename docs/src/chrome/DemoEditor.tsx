import { CodeBlock } from "@content-editor/code/demo/Block";
import { Code } from "@content-editor/code/demo/model";
import { ContentEditor } from "@content-editor/core";
import { useContentEditor } from "@content-editor/core/use-content-editor";
import { useEditorPrism } from "@content-editor/core/use-editor-prism";
import { ContentEditableOptions } from "@content-editor/editable";
import { RichTextBlock } from "@content-editor/editable/demo/rich-text/Block";
import { RichText } from "@content-editor/editable/demo/rich-text/model";
import { Prism } from "@content-editor/utils/optics";
import PrismJS from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import { downgradeBlockType } from "../demo/command";
import { DemoBlock } from "../demo/model";

function highlight(code: string) {
  return PrismJS.highlight(code, PrismJS.languages["tsx"], "tsx");
}

export function DemoEditor({
  id,
  value,
  onChange,
  ...options
}: ContentEditableOptions & {
  id: string;
  value: DemoBlock[];
  onChange?: (blocks: DemoBlock[]) => void;
}) {
  const editor = useContentEditor({
    id,
    initialValue: value,
    onCommit: onChange,
  });

  return editor.blocks.map((block) =>
    block.type === "code" ? (
      <DemoCodeBlock
        key={block.id}
        id={block.id}
        editor={editor}
        {...options}
      />
    ) : (
      <DemoTextBlock
        key={block.id}
        id={block.id}
        editor={editor}
        {...options}
      />
    ),
  );
}

function DemoTextBlock({
  id,
  editor,
  ...options
}: ContentEditableOptions & {
  id: number;
  editor: ContentEditor<DemoBlock>;
}) {
  const textEditor = useEditorPrism<DemoBlock, RichText>({
    id,
    editor,
    prism: Prism.fromGuard((b): b is RichText => b.type !== "code"),
  });

  return (
    <RichTextBlock
      editor={textEditor}
      filter={(b) => b.id === id}
      {...options}
    />
  );
}

function DemoCodeBlock({
  id,
  editor,
  ...options
}: ContentEditableOptions & {
  id: number;
  editor: ContentEditor<DemoBlock>;
}) {
  const codeEditor = useEditorPrism<DemoBlock, Code>({
    id,
    editor,
    prism: Prism.fromGuard((b): b is Code => b.type === "code"),
  });

  return (
    <CodeBlock
      editor={codeEditor}
      filter={(b) => b.id === id}
      highlight={highlight}
      pre={{ className: "sb-unstyled prism language-typescript" }}
      placeholder="Type some code..."
      onDelete={() => editor.exec(downgradeBlockType, id)}
      {...options}
    />
  );
}
