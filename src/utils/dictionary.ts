import { Builder, DictionaryValue, Slice } from '@ton/core';

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
