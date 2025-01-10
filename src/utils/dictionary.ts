import { Builder, DictionaryValue, Slice } from '@ton/core';

/**
 * we use `coinsMarshaller` for dictionaries which store coins types as values.
 * @example
 * ```typescript
 * new Dictionary(Dictionary.Keys.uint(32), coinsMarshaller());
 * ```
 */
export function coinsMarshaller(): DictionaryValue<bigint> {
  return {
    serialize: (src: never, builder: Builder) => {
      builder.storeCoins(src);
    },
    parse: (src: Slice) => {
      return src.loadCoins();
    },
  };
}
