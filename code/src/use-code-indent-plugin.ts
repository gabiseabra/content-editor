import {
  AnyBlock,
  ContentEditor,
  EditorPlugin,
  SelectionRange,
  SpliceRange,
} from "@content-editor/core";
import { runGenerator } from "@content-editor/utils/generator";
import { Update } from "../../editable/src";
import { getLines } from "./utils/get-lines";

type CodeIndentOptions<TBlock extends AnyBlock> = {
  tabCharacter?: string;
  update: Update<TBlock>;
};

export const useCodeIndentPlugin =
  <TBlock extends AnyBlock>(
    options: CodeIndentOptions<TBlock>,
  ): EditorPlugin<TBlock> =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      if (e.key === "Tab") {
        // Prevent focus change
        e.preventDefault();
        handleShift(block, editor, options, e.shiftKey ? -1 : 1);
      }
    },
    onInput(e) {
      if (e.nativeEvent.inputType === "insertLineBreak") {
        handleNewLine(block, editor, options);
      }
    },
  });

function handleShift<TBlock extends AnyBlock>(
  block: TBlock,
  editor: ContentEditor<TBlock>,
  { tabCharacter = "  ", update }: CodeIndentOptions<TBlock>,
  direction: 1 | -1,
) {
  const element = editor.ref(block.id).element;
  const selection = element && SelectionRange.read(element);
  const code = element?.textContent ?? "";

  if (!selection) return;

  if (SelectionRange.isCollapsed(selection) && direction === 1) {
    editor.push({
      type: "update",
      // Insert tab character at caret
      block: update(
        block,
        SpliceRange.apply(code, {
          offset: selection.start,
          deleteCount: 0,
          insert: tabCharacter,
        }),
      ),
      targetBefore: {
        id: block.id,
        ...selection,
      },
      targetAfter: {
        id: block.id,
        start: selection.start + tabCharacter.length,
        end: selection.end + tabCharacter.length,
      },
    });
  } else if (SelectionRange.isCollapsed(selection) && direction == -1) {
    if (!code.startsWith(tabCharacter)) return;

    editor.push({
      type: "update",
      block: update(block, code.slice(tabCharacter.length)),
      targetBefore: {
        id: block.id,
        ...selection,
      },
      targetAfter: {
        id: block.id,
        start: selection.start - tabCharacter.length,
        end: selection.end - tabCharacter.length,
      },
    });
  } else if (direction === 1) {
    // Indent selected lines
    const selectedLines = runGenerator(
      getLines(code, selection.start, selection.end),
    );

    editor.push({
      type: "update",
      block: update(
        block,
        code.slice(0, selectedLines.result.start) +
          selectedLines.values.map((line) => tabCharacter + line).join("\n") +
          code.slice(selectedLines.result.end),
      ),
      targetBefore: {
        id: block.id,
        ...selection,
      },
      targetAfter: {
        id: block.id,
        start: selection.start + tabCharacter.length,
        end: selection.end + tabCharacter.length * selectedLines.values.length,
      },
    });
  } else {
    // Unindent selected lines
    const selectedLines = runGenerator(
      getLines(code, selection.start, selection.end),
    );
    const nextCode =
      code.slice(0, selectedLines.result.start) +
      selectedLines.values
        .map((line) =>
          line.startsWith(tabCharacter)
            ? line.slice(tabCharacter.length)
            : line,
        )
        .join("\n");

    if (nextCode === code) return;

    editor.push({
      type: "update",
      block: update(block, nextCode),
      targetBefore: {
        id: block.id,
        ...selection,
      },
      targetAfter: {
        id: block.id,
        start:
          selection.start -
          (selectedLines.values[0]?.startsWith(tabCharacter)
            ? tabCharacter.length
            : 0),
        end:
          selection.end -
          (selectedLines.values.filter((line) => line.startsWith(tabCharacter))
            .length -
            1) *
            selectedLines.values.length,
      },
    });
  }

  editor.commit();
}

function handleNewLine<TBlock extends AnyBlock>(
  block: TBlock,
  editor: ContentEditor<TBlock>,
  { tabCharacter = "  ", update }: CodeIndentOptions<TBlock>,
) {
  const element = editor.ref(block.id).element;
  const selection = element && SelectionRange.read(element);
  const code = element?.textContent ?? "";

  if (!selection || !SelectionRange.isCollapsed(selection)) return;

  const selectedLines =
    selection && runGenerator(getLines(code, selection.start, selection.end));
  const line = selectedLines.values[0] ?? "";
  const tabSize = (() => {
    let i = 0;

    while (line.slice(i, tabCharacter.length) === tabCharacter) i++;

    return i + (line.slice(0, selection.end).trim().endsWith("{") ? 1 : 0);
  })();

  editor.push({
    type: "update",
    block: update(
      block,
      SpliceRange.apply(code, {
        offset: selection.start,
        deleteCount: 0,
        insert: tabCharacter.repeat(tabSize),
      }),
    ),
    targetBefore: {
      id: block.id,
      ...selection,
    },
    targetAfter: {
      id: block.id,
      start: selection.start + tabCharacter.length * tabSize,
      end: selection.end + tabCharacter.length * tabSize,
    },
  });

  editor.commit();
}
