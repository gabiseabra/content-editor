import { keys } from "@content-editor/utils/object";

export type Annotations = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  bgColor?: string;
};

export type RichTextItem = {
  text: string;
  url?: string;
} & Annotations;

export type RichTextBlock =
  | { type: "text"; id: number; text: RichTextItem[] }
  | { type: "code"; id: number; code: string };

export const RichTextBlock = {
  /** Block mutation strategy */

  merge: (left: RichTextBlock, right: RichTextBlock): RichTextBlock => {
    if (left.type === "code" && right.type === "code") {
      return { type: "code", id: left.id, code: left.code + right.code };
    }
    return RichTextBlock.normalize({
      type: "text",
      id: left.id,
      text: [...RichTextBlock.toArray(left), ...RichTextBlock.toArray(right)],
    });
  },

  split: (block: RichTextBlock, offset: number) => ({
    left: RichTextBlock.normalize(RichTextBlock.slice(block, 0, offset)),
    right: RichTextBlock.normalize(
      RichTextBlock.slice(
        {
          type: "text",
          id: Math.random(),
          text: RichTextBlock.toArray(block),
        },
        offset,
        RichTextBlock.length(block),
      ),
    ),
  }),

  /** Inline mutation strategy */

  splice: (
    block: RichTextBlock,
    offset: number,
    deleteCount: number,
    text: string,
  ): RichTextBlock => {
    if (block.type === "code") {
      const chars = [...block.code];
      chars.splice(offset, deleteCount, text);
      return { ...block, code: chars.join("") };
    }

    const total = RichTextBlock.length(block);
    const before = RichTextBlock.slice(block, 0, offset);
    const after = RichTextBlock.slice(block, offset + deleteCount, total);

    return RichTextBlock.normalize({
      type: "text",
      id: block.id,
      text: [
        ...RichTextBlock.toArray(before),
        { text },
        ...RichTextBlock.toArray(after),
      ],
    });
  },

  update: (block: RichTextBlock, text: string): RichTextBlock =>
    block.type === "text"
      ? { ...block, text: [{ text }] }
      : { ...block, code: text },

  /** Utilities */

  slice: (
    block: RichTextBlock,
    start: number,
    end: number = RichTextBlock.length(block),
  ): RichTextBlock => {
    if (block.type === "code") {
      return { ...block, code: block.code.slice(start, end) };
    }

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

    return { ...block, text: result };
  },

  mapRichText: (
    block: RichTextBlock,
    f: (item: RichTextItem) => RichTextItem,
    start: number,
    end: number = RichTextBlock.length(block),
  ) => {
    if (block.type === "code") return block;
    const before = RichTextBlock.toArray(RichTextBlock.slice(block, 0, start));
    const middle = RichTextBlock.toArray(
      RichTextBlock.slice(block, start, end),
    );
    const after = RichTextBlock.toArray(RichTextBlock.slice(block, end));

    return RichTextBlock.normalize({
      ...block,
      text: [...before, ...middle.map(f), ...after],
    });
  },

  normalize: (block: RichTextBlock): RichTextBlock => {
    if (block.type === "code") return block;

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

    return { ...block, text: result };
  },

  toArray: (block: RichTextBlock): RichTextItem[] =>
    block.type === "text" ? block.text : [{ text: block.code }],

  toString: (block: RichTextBlock): string =>
    block.type === "code"
      ? block.code
      : block.text.reduce((text, i) => text + i.text, ""),

  length: (block: RichTextBlock) => RichTextBlock.toString(block).length,

  hasAnnotations: (
    block: RichTextBlock,
    a: Annotations,
    start: number,
    end: number = RichTextBlock.length(block),
  ) => {
    return RichTextBlock.toArray(RichTextBlock.slice(block, start, end)).every(
      (item) =>
        (typeof a.bold !== "undefined" && a.bold === item.bold) ||
        (typeof a.italic !== "undefined" && a.italic === item.italic) ||
        (typeof a.underline !== "undefined" &&
          a.underline === item.underline) ||
        (typeof a.strikethrough !== "undefined" &&
          a.strikethrough === item.strikethrough) ||
        (typeof a.color !== "undefined" && a.color === item.color) ||
        (typeof a.bgColor !== "undefined" && a.bgColor === item.bgColor),
    );
  },

  toggleAnnotations: (
    block: RichTextBlock,
    annotations: Annotations,
    start: number,
    end: number = RichTextBlock.length(block),
  ) => {
    if (block.type !== "text") return block;

    const hasAnnotations = RichTextBlock.hasAnnotations(
      block,
      annotations,
      start,
      end,
    );
    const toggledAnnotations = keys(annotations).reduce(
      (acc, key) => {
        if (hasAnnotations) acc[key] = undefined;
        return acc;
      },
      { ...annotations },
    );

    return RichTextBlock.mapRichText(
      block,
      (item) => ({
        ...item,
        ...toggledAnnotations,
      }),
      start,
      end,
    );
  },
};

/** Misc internals */

const eqAnnotations = (a: RichTextItem, b: RichTextItem) =>
  a.bold === b.bold &&
  a.italic === b.italic &&
  a.underline === b.underline &&
  a.strikethrough === b.strikethrough &&
  a.color === b.color &&
  a.bgColor === b.bgColor;
