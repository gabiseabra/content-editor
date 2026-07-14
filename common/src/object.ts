export type EmptyObject = { [k: string]: never };

export type GenericObject = { [k: string]: unknown };

export type WithRequired<T, K extends keyof T> = [K] extends [keyof T]
  ? Required<Pick<T, K>> & Omit<T, K>
  : never;

export type WithOptional<T, K extends keyof T> = [K] extends [keyof T]
  ? Partial<Pick<T, K>> & Omit<T, K>
  : never;

export function keys<T extends object>(object: T): (keyof T)[] {
  return Object.keys(object) as (keyof T)[];
}

export function autoBind<T extends object>(self: T): T {
  return keys(self).reduce((self, key) => {
    if (self[key] instanceof Function) {
      return Object.assign(self, { [key]: self[key].bind(self) });
    }
    return self;
  }, self);
}

export function createRecord<const K extends PropertyKey, V>(
  keys: readonly K[],
  value: (key: K) => V,
): Record<K, V> {
  const out = {} as Record<K, V>;

  for (const key of keys) {
    out[key] = value(key);
  }

  return out;
}
