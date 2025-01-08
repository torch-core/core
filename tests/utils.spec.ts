import { beginCell } from '@ton/core';
import { Asset } from '../src';
import {
  storeCoinsNested,
  parseCoinsFromNestedCell,
  storeSortedAssetNested,
  parseAssetsFromNestedCell,
} from '../src/utils';

describe('Test Nested Coin Cell', () => {
  // Parameterized test function
  const testArrayLength = (length: number) => {
    const sortedArray = Array.from({ length }, (_, i) => BigInt(i));
    const nestedCoinCell = beginCell().store(storeCoinsNested(sortedArray)).endCell();
    const parsedResult = parseCoinsFromNestedCell(nestedCoinCell);
    expect(parsedResult).toEqual(sortedArray);
  };

  // Parameterized test cases
  const coinCellLengths = [1, 6, 7, 8, 15, 100];
  coinCellLengths.forEach((length) => {
    it(`Should store nested coin cell with array length ${length}`, () => {
      testArrayLength(length);
    });
  });
});

describe('Test Nested Asset Cell', () => {
  // Parameterized test function
  const testArrayLength = (length: number) => {
    const sortedArray = Array.from({ length }, () => Asset.ton());
    const nestedAssetCell = beginCell().store(storeSortedAssetNested(sortedArray)).endCell();
    const parsedResult = parseAssetsFromNestedCell(nestedAssetCell);
    expect(parsedResult).toEqual(sortedArray);
  };

  // Parameterized test cases
  const assetCellLengths = [1, 3, 4, 5, 15, 100];
  assetCellLengths.forEach((length) => {
    it(`Should store nested asset cell with array length ${length}`, () => {
      testArrayLength(length);
    });
  });
});
