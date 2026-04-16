import { CodeBlock } from "@content-editor/code/demo/Block";
import { Code } from "@content-editor/code/demo/model";
import { ContentEditor } from "@content-editor/core";
import { useContentEditor } from "@content-editor/core/use-content-editor";
import { useEditorTraversal } from "@content-editor/core/use-editor-traversal";
import { ContentEditableOptions } from "@content-editor/editable";
import { RichTextBlock } from "@content-editor/editable/demo/rich-text/Block";
import { RichText } from "@content-editor/editable/demo/rich-text/model";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import { downgradeBlockType } from "../demo/command";
import { DemoBlock } from "../demo/model";

function highlight(code: string) {
  return Prism.highlight(code, Prism.languages["tsx"], "tsx");
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
        options={options}
      />
    ) : (
      <DemoTextBlock
        key={block.id}
        id={block.id}
        editor={editor}
        options={options}
      />
    ),
  );
}

function DemoTextBlock({
  id,
  editor,
  options,
}: {
  id: number;
  editor: ContentEditor<DemoBlock>;
  options: ContentEditableOptions;
}) {
  const textEditor = useEditorTraversal<DemoBlock, RichText>({
    id,
    editor,
    traversal: {
      get(block) {
        return block.type === "text" ? [block] : [];
      },
      modify(block, f) {
        if (block.type !== "text") return block;
        return f(block);
      },
    },
  });

  return <RichTextBlock editor={textEditor} {...options} />;
}

function DemoCodeBlock({
  id,
  editor,
  options: _options,
}: {
  id: number;
  editor: ContentEditor<DemoBlock>;
  options: ContentEditableOptions;
}) {
  const codeEditor = useEditorTraversal<DemoBlock, Code>({
    id,
    editor,
    traversal: {
      get(block) {
        return block.type === "code" ? [block] : [];
      },
      modify(block, f) {
        if (block.type !== "code") return block;
        return f(block);
      },
    },
  });
  return (
    <CodeBlock
      editor={codeEditor}
      highlight={highlight}
      pre={{ className: "sb-unstyled prism language-typescript" }}
      placeholder="Type some code..."
      onDelete={() => editor.exec(downgradeBlockType, id)}
    />
  );
}
