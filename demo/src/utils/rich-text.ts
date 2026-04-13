import { EditorCommand, SelectionRange } from "@content-editor/core";

export type RichTextItem = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  bgColor?: string;
};

export type RichTextBlock = {
  id: number;
  text: RichTextItem[];
};

export const RichTextBlock = {
  merge: (left: RichTextBlock, right: RichTextBlock): RichTextBlock =>
    RichTextBlock.normalize({
      id: left.id,
      text: [...left.text, ...right.text],
    }),

  split: (block: RichTextBlock, offset: number) => ({
    left: RichTextBlock.normalize(RichTextBlock.slice(block, 0, offset)),
    right: RichTextBlock.normalize(
      RichTextBlock.slice(
        {
          id: Math.random(),
          text: block.text,
        },
        offset,
        RichTextBlock.length(block),
      ),
    ),
  }),

  splice: (
    block: RichTextBlock,
    offset: number,
    deleteCount: number,
    text: string,
  ): RichTextBlock => {
    const total = RichTextBlock.length(block);
    const before = RichTextBlock.slice(block, 0, offset).text;
    const after = RichTextBlock.slice(block, offset + deleteCount, total).text;
    return RichTextBlock.normalize({
      id: block.id,
      text: [...before, { text }, ...after],
    });
  },

  update: (block: RichTextBlock, text: string): RichTextBlock =>
    RichTextBlock.normalize({
      id: block.id,
      text: [{ text }],
    }),

  normalize: (block: RichTextBlock): RichTextBlock => {
    const result: RichTextItem[] = [];
    for (const item of block.text) {
      if (item.text === "") continue;
      const last = result[result.length - 1];
      if (last && eqAnnotations(last, item)) {
        result[result.length - 1] = { ...last, text: last.text + item.text };
      } else {
        result.push({ ...item });
      }
    }
    return { id: block.id, text: result };
  },

  slice: (
    block: RichTextBlock,
    start: number,
    end: number = RichTextBlock.length(block),
  ): RichTextBlock => {
    const result: RichTextItem[] = [];
    let pos = 0;
    for (const item of block.text) {
      const next = pos + item.text.length;
      if (next > start && pos < end) {
        const from = Math.max(0, start - pos);
        const to = Math.min(item.text.length, end - pos);
        result.push({ ...item, text: item.text.slice(from, to) });
      }
      pos = next;
      if (pos >= end) break;
    }
    return { id: block.id, text: result };
  },

  length(block: RichTextBlock) {
    return block.text.reduce((n, i) => n + i.text.length, 0);
  },
};

/** Commands */

export function toggleAnnotation(
  annotation: "bold" | "italic" | "underline" | "strikethrough",
): EditorCommand<RichTextBlock> {
  return ({ block, data: selection }) => {
    if (!selection || SelectionRange.isCollapsed(selection)) return;

    const before = RichTextBlock.slice(block, 0, selection.start).text;
    const middle = RichTextBlock.slice(
      block,
      selection.start,
      selection.end,
    ).text.map((item) => ({
      ...item,
      [annotation]: !item[annotation],
    }));
    const after = RichTextBlock.slice(block, selection.end).text;

    return RichTextBlock.normalize({
      id: block.id,
      text: [...before, ...middle, ...after],
    });
  };
}

/** Factories */

export function p(id: number, ...text: RichTextItem[]) {
  return { id, text };
}

export function span(text: string, annotations?: Omit<RichTextItem, "text">) {
  return { text, ...annotations };
}

/** Misc */

const eqAnnotations = (a: RichTextItem, b: RichTextItem) =>
  a.bold === b.bold &&
  a.italic === b.italic &&
  a.underline === b.underline &&
  a.strikethrough === b.strikethrough &&
  a.color === b.color &&
  a.bgColor === b.bgColor;
