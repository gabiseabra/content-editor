import { RefObject, useLayoutEffect, useRef } from "react";
import { TypedEventTarget } from "typescript-event-target";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventTarget = HTMLElement | Window | Document | TypedEventTarget<any>;

type ExtractEventMap<Target> =
  Target extends TypedEventTarget<infer T>
    ? T
    : Target extends Document
      ? DocumentEventMap
      : Target extends HTMLElement
        ? HTMLElementEventMap
        : never;

export function useEventListener<
  Target extends EventTarget,
  TEventType extends keyof ExtractEventMap<Target> & string,
>(
  elementOrRef: Target | RefObject<Target> | null,
  type: TEventType,
  listener: (ev: ExtractEventMap<Target>[TEventType]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  const element =
    elementOrRef && "current" in elementOrRef
      ? elementOrRef.current
      : elementOrRef;

  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useLayoutEffect(() => {
    if (!element) return;
    const f: typeof listener = (e) => listenerRef.current(e);
    if (element instanceof TypedEventTarget) {
      element.addEventListener(type, f, options);
      return () => element.removeEventListener(type, f, options);
    } else {
      element.addEventListener(type, f, options);
      return () => element.removeEventListener(type, f, options);
    }
  }, [element, type, hashOptions(options)]);
}

const hashOptions = (options?: AddEventListenerOptions | boolean) => {
  if (typeof options === "object")
    return `${options.capture}:${options.once}:${options.passive}:${options.signal}`;
  return options;
};
