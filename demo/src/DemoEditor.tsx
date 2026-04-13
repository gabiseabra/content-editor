import { useContentEditor } from "@content-editor/core/hooks/use-content-editor";
import { useLoggerPlugin } from "@content-editor/editable/use-logger-plugin";

export function DemoEditor() {
  const editor = useContentEditor({
    id: "demo",
    initialValue: [{ id: "1", text: "Hello" }],
  });
  const editable = useLoggerPlugin((e) => console.log(e))(editor);

  return editor.blocks.map((block) => (
    <div
      key={block.id}
      contentEditable
      suppressContentEditableWarning
      {...editable(block)}
    >
      {block.text}
    </div>
  ));
}
