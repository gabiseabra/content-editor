import { Code } from "@content-editor/code/demo/model";
import { RichText } from "@content-editor/editable/demo/rich-text/model";

export type DemoBlock = Code | RichText;

export const DemoBlock = {
  /** Block mutation strategy */

  merge: (left: DemoBlock, right: DemoBlock) => {
    if (left.type === "code" && right.type === "code")
      return Code.merge(left, right);
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
