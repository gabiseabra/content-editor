export type Code = {
  type: "code";
  id: number;
  code: string;
};

export const Code = {
  /** Block mutation strategy */

  merge: (left: Code, right: Code) => ({
    type: "code" as const,
    id: left.id,
    code: left.code + right.code,
  }),

  split: (block: Code, offset: number) => ({
    left: {
      type: "code" as const,
      id: block.id,
      code: block.code.slice(0, offset),
    },
    right: {
      type: "code" as const,
      id: Math.random(),
      code: block.code.slice(offset),
    },
  }),

  /** Inline mutation strategy */

  splice: (
    block: Code,
    offset: number,
    deleteCount: number,
    insert: string,
  ) => {
    const chars = [...block.code];
    chars.splice(offset, deleteCount, insert);
    return {
      type: "code" as const,
      id: block.id,
      code: chars.join(""),
    };
  },

  update: (block: Code, code: string) => ({
    type: "code" as const,
    id: block.id,
    code,
  }),
};
