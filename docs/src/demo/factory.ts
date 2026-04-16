import { DemoBlock } from "./model";

export * from "@content-editor/editable/demo/rich-text/factory";

export function code(id: number, code: string): DemoBlock {
  return { type: "code", id, code };
}
