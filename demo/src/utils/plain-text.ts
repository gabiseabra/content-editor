export type PlainTextBlock = {
  id: number;
  text: string;
};

export const PlainTextBlock = {
  merge: (left: PlainTextBlock, right: PlainTextBlock) => ({
    id: left.id,
    text: left.text + right.text,
  }),

  split: (block: PlainTextBlock, offset: number) => ({
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
    block: PlainTextBlock,
    offset: number,
    deleteCount: number,
    insert: string,
  ) => {
    const chars = [...block.text];
    chars.splice(offset, deleteCount, insert);
    return { id: block.id, text: chars.join("") };
  },

  update: (block: PlainTextBlock, text: string) => ({ id: block.id, text }),
};
