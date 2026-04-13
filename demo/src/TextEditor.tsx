import { useContentEditor } from "@content-editor/core/use-content-editor";
import { useEditorPlugins } from "@content-editor/core/use-editor-plugins";
import { useAutoCommitPlugin } from "@content-editor/editable/use-auto-commit-plugin";
import { useBlockMutationPlugin } from "@content-editor/editable/use-block-mutation-plugin";
import { useBlockNavigationPlugin } from "@content-editor/editable/use-block-navigation-plugin";
import { useHistoryPlugin } from "@content-editor/editable/use-history-plugin";
import { useInlineMutationPlugin } from "@content-editor/editable/use-inline-mutation-plugin";
import {
  createLogger,
  useLoggerPlugin,
} from "@content-editor/editable/use-logger-plugin";
import { TextBlock } from "@content-editor/utils/text-block";
import { memo } from "react";

export const TextEditor = memo(function TextEditor() {
  const editor = useContentEditor<TextBlock>({
    id: "demo",
    initialValue: [{ id: 1, text: "Hello" }],
  });
  const editable = useEditorPlugins(
    useBlockMutationPlugin(TextBlock),
    useInlineMutationPlugin(TextBlock),
    useLoggerPlugin(createLogger(true)),
    useAutoCommitPlugin({ debounceMs: 200 }),
    useHistoryPlugin(),
    useBlockNavigationPlugin,
  )(editor);

  return editor.blocks.map((block) => (
    <p
      key={block.id}
      ref={editor.ref(block.id)}
      contentEditable
      suppressContentEditableWarning
      {...editable(block)}
    >
      {block.text}
    </p>
  ));
});
