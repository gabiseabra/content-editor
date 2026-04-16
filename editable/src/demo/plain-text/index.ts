export type PlainTextBlock = {
  id: number;
  text: string;
};

export const PlainTextBlock = {
  /** Block mutation strategy */

  /**
   * Join two blocks.
   * @required
   */
  merge: (left: PlainTextBlock, right: PlainTextBlock) => ({
    id: left.id,
    text: left.text + right.text,
  }),

  /**
   * Split a block into two blocks at caret offset.
   * @required
   */
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

  /** Inline mutation strategy */

  /**
   * Replace a range of the block's content, starting at `offset` and
   * spanning `deleteCount` characters, with `insert`.
   *
   * Splice results are batched: consecutive keystrokes are coalesced into
   * a single history entry rather than one per character.
   * @required
   */
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

  /**
   * Method to override the whole content of the block with a new text string.
   *
   * This is only applied for blocks registered on input or textarea elements,
   * inline-mutation-plugin will apply the change imediatelly, and the element
   * will behave like a controlled input.
   * @optional
   */
  update: (block: PlainTextBlock, text: string) => ({ id: block.id, text }),
};
