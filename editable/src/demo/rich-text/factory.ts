import { RichTextBlock, RichTextItem } from ".";

export function p(id: number, ...text: RichTextItem[]): RichTextBlock {
  return { type: "text", id, text };
}

export function code(id: number, code: string): RichTextBlock {
  return { type: "code", id, code };
}

export function span(text: string, annotations?: Omit<RichTextItem, "text">) {
  return { text, ...annotations };
}
