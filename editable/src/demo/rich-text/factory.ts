import { RichText, RichTextItem } from "./model";

export function p(id: number, ...text: RichTextItem[]): RichText {
  return { type: "text", id, text };
}

export function h1(id: number, ...text: RichTextItem[]): RichText {
  return { type: "heading", id, text };
}

export function h2(id: number, ...text: RichTextItem[]): RichText {
  return { type: "subheading", id, text };
}

export function span(text: string, annotations?: Omit<RichTextItem, "text">) {
  return { text, ...annotations };
}
