import { EditorCommand } from "@content-editor/core";
import { DemoBlock } from "./model";

export const downgradeBlockType: EditorCommand<DemoBlock> = ({
  block,
  data: currentSelection,
  editor,
}) => {
  console.log(currentSelection);
  editor.push({
    type: "update",
    block: {
      type: "text",
      id: block.id,
      text: block.type === "code" ? [{ text: block.code }] : block.text,
    },
    targetAfter: { id: block.id, start: 0, end: 0 },
    targetBefore: {
      id: currentSelection?.id ?? block.id,
      childId: currentSelection?.childId,
      start: 0,
      end: 0,
    },
  });
  editor.commit();
};
