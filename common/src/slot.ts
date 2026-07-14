// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySlotFunction<T = any> = (...args: any[]) => T;
export type Slot<F extends AnySlotFunction = AnySlotFunction> =
  | F
  | ReturnType<F>;
export type SlotParameters<S extends Slot> = S extends AnySlotFunction
  ? Parameters<S>
  : [];
export type SlotValue<S extends Slot> = S extends AnySlotFunction
  ? ReturnType<S>
  : S;

export const Slot = {
  extract<S extends Slot>(slot: S, ...args: SlotParameters<S>): SlotValue<S> {
    if (slot instanceof Function) return slot(...args);
    return slot as SlotValue<S>;
  },

  map<S extends Slot, A>(
    slot: S,
    f: (a: SlotValue<S>) => A,
  ): Slot<(...args: SlotParameters<S>) => A> {
    return (...args) => f(Slot.extract(slot, ...args));
  },

  join<S extends Slot, A>(
    slots: S[],
    f: (as: SlotValue<S>[]) => A,
  ): Slot<(...args: SlotParameters<S>) => A> {
    return (...args) => f(slots.map((slot) => Slot.extract(slot, ...args)));
  },

  every<S extends Slot>(
    slots: S[],
  ): Slot<(...args: SlotParameters<S>) => boolean> {
    return Slot.join(slots, (as) => as.every(Boolean));
  },

  some<S extends Slot>(
    slots: S[],
  ): Slot<(...args: SlotParameters<S>) => boolean> {
    return Slot.join(slots, (as) => as.some(Boolean));
  },
};
