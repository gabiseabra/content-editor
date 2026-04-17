import { Code } from "@content-editor/code/demo/model";
import { RichText } from "@content-editor/editable/demo/rich-text/model";

export type DemoBlock = Code | RichText;

function toText(block: DemoBlock): RichText {
  if (block.type === "text") return block;
  return { type: "text", id: block.id, text: [{ text: block.code }] };
}

export const DemoBlock = {
  /** Block mutation strategy */

  merge: (left: DemoBlock, right: DemoBlock): DemoBlock | null => {
    if (left.type === "code" && right.type === "code")
      return Code.merge(left, right);
    else return RichText.merge(toText(left), toText(right));
  },

  split: (block: DemoBlock, offset: number) => {
    if (block.type === "code") return Code.split(block, offset);
    else return RichText.split(block, offset);
  },

  /** Inline mutation strategy */

  splice: (
    block: DemoBlock,
    offset: number,
    deleteCount: number,
    insert: string,
  ) => {
    if (block.type === "code")
      return Code.splice(block, offset, deleteCount, insert);
    else return RichText.splice(block, offset, deleteCount, insert);
  },

  update: (block: DemoBlock, value: string) => {
    if (block.type === "code") return Code.update(block, value);
    else return RichText.update(block, value);
  },
};
