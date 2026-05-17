import { CodeBlock } from "@content-editor/code/demo/Block";
import { Code } from "@content-editor/code/demo/model";
import { ContentEditor, EditorProjection } from "@content-editor/core";
import { useContentEditor } from "@content-editor/core/use-content-editor";
import { useEditorProjection } from "@content-editor/core/use-editor-projection";
import { RichTextBlock } from "@content-editor/editable/demo/rich-text/Block";
import { RichText } from "@content-editor/editable/demo/rich-text/model";
import { EditablePluginOptions } from "@content-editor/editable/use-editable-plugin";
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
}: EditablePluginOptions & {
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
}: EditablePluginOptions & {
  id: number;
  editor: ContentEditor<DemoBlock>;
}) {
  const textEditor = useEditorProjection<DemoBlock, RichText>({
    editor,
    projection: EditorProjection.fromGuard((b) => b.type !== "code"),
  });

  return <RichTextBlock editor={textEditor} {...options} />;
}

function DemoCodeBlock({
  id,
  editor,
  ...options
}: EditablePluginOptions & {
  id: number;
  editor: ContentEditor<DemoBlock>;
}) {
  const codeEditor = useEditorProjection<DemoBlock, Code>({
    editor,
    projection: EditorProjection.fromGuard((b) => b.type === "code"),
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
