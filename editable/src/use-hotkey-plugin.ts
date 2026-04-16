import {
  AnyBlock,
  EditorCommand,
  EditorPlugin,
  EditorTarget,
} from "@content-editor/core";

type Mod = "Ctrl" | "Alt" | "Shift" | "Meta";
type Key =
  | "Enter"
  | "Tab"
  | "Escape"
  | "Backspace"
  | "Delete"
  | "Space"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export type Hotkey = `${Mod}+${Key}` | `${Mod}+${Mod}+${Key}` | Key;

export const useHotkeyPlugin =
  <TBlock extends AnyBlock>(
    hotkey: Hotkey | Hotkey[],
    command: EditorCommand<TBlock>,
  ): EditorPlugin<TBlock> =>
  (editor) =>
  (block) => ({
    onKeyDown(e) {
      const key = toHotkey(e.nativeEvent);
      const selection = EditorTarget.read(editor);

      if (
        !selection ||
        !(typeof hotkey === "string" ? hotkey === key : hotkey.includes(key))
      )
        return;

      const currentBlock = editor.peek(block.id) ?? block;
      const nextBlock = command({
        block: currentBlock,
        data: selection,
        editor,
      });

      if (nextBlock) {
        const data = new useHotkeyPlugin.EventData(key);

        editor.push({
          data,
          type: "update",
          block: nextBlock,
          targetBefore: selection,
          targetAfter: selection,
        });
        editor.commit(data);

        e.preventDefault();
        e.stopPropagation();
      }
    },
  });

function toHotkey(e: KeyboardEvent): Hotkey {
  const mods: Mod[] = [];
  if (e.ctrlKey) mods.push("Ctrl");
  if (e.altKey) mods.push("Alt");
  if (e.shiftKey) mods.push("Shift");
  if (e.metaKey) mods.push("Meta");

  const key =
    e.key === " " ? "Space" : e.key.length === 1 ? e.key.toLowerCase() : e.key;
  return (mods.length ? `${mods.join("+")}+${key}` : key) as Hotkey;
}

useHotkeyPlugin.EventData = class HotkeyEventData {
  constructor(public hotkey: Hotkey) {}
};
