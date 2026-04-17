import { Ref } from "react";

/**
 * Converts a `Ref<T>` to a ref callback so it can be passed as a `ref` prop.
 *
 * `RefObject<T>` is invariant — `T` is both read and written, so
 * `RefObject<HTMLElement>` is not assignable to `Ref<HTMLSpanElement>`.
 * Callbacks are contravariant in their argument type, so
 * `(HTMLElement | null) => void` is assignable wherever
 * `(HTMLSpanElement | null) => void` is expected.
 */
export function applyRef<T>(ref?: Ref<T>) {
  return (element: T | null) => {
    if (!ref) return;
    if (ref instanceof Function) ref(element);
    else {
      ref.current = element;
    }
  };
}

export function mergeRefs<T>(...refs: Ref<T>[]) {
  return (element: T | null) => refs.forEach((ref) => applyRef(ref)(element));
}
