import { jest } from "@jest/globals";
import { TransformStream } from "node:stream/web";
import { TextDecoder, TextEncoder } from "node:util";

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

global.TransformStream = TransformStream;

global.fetch = () => {
  throw new Error("fetch not implemented");
};

global.jest = jest;
