export type TextBlock = {
  id: number;
  text: string;
};

export const TextBlock = {
  merge: (left: TextBlock, right: TextBlock) => ({
    id: left.id,
    text: left.text + right.text,
  }),
  split: (block: TextBlock, offset: number) => ({
    left: {
      id: block.id,
      text: block.text.slice(0, offset),
    },
    right: {
      id: Math.random(),
      text: block.text.slice(offset),
    },
  }),
  splice: (
    block: TextBlock,
    offset: number,
    deleteCount: number,
    insert: string,
  ) => {
    const chars = [...block.text];
    chars.splice(offset, deleteCount, insert);
    return { id: block.id, text: chars.join("") };
  },
  update: (block: TextBlock, text: string) => ({ id: block.id, text }),
};
