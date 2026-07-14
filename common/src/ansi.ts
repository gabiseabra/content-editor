import { Theme } from "./theme";

export namespace ANSI {
  export function rgb(hex: string): [number, number, number] {
    const h = hex.replace(/^#/, "");
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  }

  export function hex(hex: string) {
    const [r, g, b] = rgb(hex);
    return (text: string) => `\x1b[38;2;${r};${g};${b}m${text}\x1b[39m`;
  }

  export function bgHex(hex: string) {
    const [r, g, b] = rgb(hex);
    return (text: string) => `\x1b[48;2;${r};${g};${b}m${text}\x1b[49m`;
  }

  export function bold(text: string) {
    return `\x1b[1m${text}\x1b[22m`;
  }

  export function italic(text: string) {
    return `\x1b[3m${text}\x1b[23m`;
  }

  export const gray = (text: string) => hex(Theme.gray)(italic(text));
  export const secondary = (text: string) =>
    hex(Theme.pink)(bgHex(Theme.bgPink)(bold(text)));
  export const primary = (text: string) =>
    hex(Theme.purple)(bgHex(Theme.bgPurple)(bold(text)));
  export const warning = (text: string) =>
    hex(Theme.orange)(bgHex(Theme.bgOrange)(bold(text)));
  export const error = (text: string) =>
    hex(Theme.red)(bgHex(Theme.bgRed)(bold(text)));
  export const success = (text: string) =>
    hex(Theme.green)(bgHex(Theme.bgGreen)(bold(text)));
  export const info = (text: string) =>
    hex(Theme.blue)(bgHex(Theme.bgBlue)(bold(text)));
}
