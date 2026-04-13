export * from "@content-editor/utils/optics";
export { SelectionRange } from "@content-editor/utils/selection-range";
export { Slot } from "@content-editor/utils/slot";
export { SpliceRange } from "@content-editor/utils/splice-range";
export { type AnyBlock, type ContentEditor, type ID } from "./editor";
export { type EditorChangeset } from "./editor/changeset";
export {
  execCommand,
  type EditorCommand,
  type ExecCommand,
} from "./editor/command";
export { EditorEvent, EditorEventTarget } from "./editor/event";
export {
  EditorAction,
  EditorHistory,
  type EditorActionBatch,
  type EditorActionCmd,
} from "./editor/history";
export {
  type AnyEditorPlugin,
  type EditableProps,
  type EditorPlugin,
} from "./editor/plugin";
export { EditorRef } from "./editor/ref";
export { EditorTarget } from "./editor/target";
