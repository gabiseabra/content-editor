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

export type RichText = { type: "text"; id: number; text: RichTextItem[] };

export const RichText = {
  /** Block mutation strategy */

  merge: (left: RichText, right: RichText): RichText => {
    return RichText.normalize({
      type: "text",
      id: left.id,
      text: [...left.text, ...right.text],
    });
  },

  split: (block: RichText, offset: number) => ({
    left: RichText.normalize(RichText.slice(block, 0, offset)),
    right: RichText.normalize(
      RichText.slice(
        {
          type: "text",
          id: Math.random(),
          text: block.text,
        },
        offset,
        RichText.length(block),
      ),
    ),
  }),

  /** Inline mutation strategy */

  splice: (
    block: RichText,
    offset: number,
    deleteCount: number,
    text: string,
  ): RichText => {
    const total = RichText.length(block);
    const before = RichText.slice(block, 0, offset);
    const after = RichText.slice(block, offset + deleteCount, total);

    return RichText.normalize({
      type: "text",
      id: block.id,
      text: [...before.text, { text }, ...after.text],
    });
  },

  update: (block: RichText, text: string): RichText => ({
    ...block,
    text: [{ text }],
  }),

  /** Misc Utilities */

  slice: (
    block: RichText,
    start: number,
    end: number = RichText.length(block),
  ): RichText => {
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

  map: (
    block: RichText,
    f: (item: RichTextItem) => RichTextItem,
    start: number = 0,
    end: number = RichText.length(block),
  ) => {
    const before = RichText.slice(block, 0, start).text;
    const middle = RichText.slice(block, start, end).text;
    const after = RichText.slice(block, end).text;

    return RichText.normalize({
      ...block,
      text: [...before, ...middle.map(f), ...after],
    });
  },

  normalize: (block: RichText): RichText => {
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

  toString: (block: RichText): string =>
    block.text.reduce((text, i) => text + i.text, ""),

  length: (block: RichText) => RichText.toString(block).length,

  hasAnnotations: (
    block: RichText,
    a: Annotations,
    start: number,
    end: number = RichText.length(block),
  ) => {
    return RichText.slice(block, start, end).text.every(
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
    block: RichText,
    annotations: Annotations,
    start: number,
    end: number = RichText.length(block),
  ) => {
    if (block.type !== "text") return block;

    const hasAnnotations = RichText.hasAnnotations(
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

    return RichText.map(
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
