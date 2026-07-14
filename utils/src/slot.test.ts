import { Slot } from "./slot.js";

describe("Slot", () => {
  describe("Slot.extract", () => {
    it("returns a static value", () => {
      expect(Slot.extract("static")).toBe("static");
    });

    it("returns a function slot result", () => {
      expect(
        Slot.extract((left: number, right: number) => left + right, 2, 3),
      ).toBe(5);
    });
  });

  describe("Slot.map", () => {
    it("maps a static slot value", () => {
      const slot = Slot.map(2, (value) => `${value}px`);

      expect(Slot.extract(slot)).toBe("2px");
    });

    it("maps a function slot result", () => {
      const slot = Slot.map(
        (left: number, right: number) => left + right,
        (value) => value * 2,
      );

      expect(Slot.extract(slot, 2, 3)).toBe(10);
    });
  });

  describe("Slot.join", () => {
    it("joins static and function slot values", () => {
      const slot = Slot.join<
        Slot<(prefix: string, suffix: string) => string>,
        string
      >(["fixed", (prefix, suffix) => `${prefix}-${suffix}`], (values) =>
        values.join("/"),
      );

      expect(Slot.extract(slot, "left", "right")).toBe("fixed/left-right");
    });
  });

  describe("Slot.every", () => {
    it("returns true when all slots resolve to true", () => {
      const slot = Slot.every<Slot<(value: number) => boolean>>([
        true,
        (value) => value > 0,
        (value) => value % 2 === 0,
      ]);

      expect(Slot.extract(slot, 2)).toBe(true);
    });

    it("returns false when any slot resolves to false", () => {
      const slot = Slot.every<Slot<(value: number) => boolean>>([
        true,
        (value) => value > 0,
        (value) => value % 2 === 0,
      ]);

      expect(Slot.extract(slot, 3)).toBe(false);
    });
  });

  describe("Slot.some", () => {
    it("returns true when any slot resolves to true", () => {
      const slot = Slot.some<Slot<(value: number) => boolean>>([
        false,
        (value) => value < 0,
        (value) => value % 2 === 0,
      ]);

      expect(Slot.extract(slot, 2)).toBe(true);
    });

    it("returns false when no slot resolves to true", () => {
      const slot = Slot.some<Slot<(value: number) => boolean>>([
        false,
        (value) => value < 0,
        (value) => value % 2 === 0,
      ]);

      expect(Slot.extract(slot, 3)).toBe(false);
    });
  });
});
