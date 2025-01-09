import { Address, beginCell } from '@ton/core';
import { Allocation, Asset } from '../src';
import {
  storeCoinsNested,
  parseCoinsFromNestedCell,
  storeSortedAssetsNested,
  parseAssetsFromNestedCell,
  normalize,
} from '../src/utils';

describe('Test Nested Coin Cell', () => {
  // Parameterized test function
  const testArrayLength = (length: number) => {
    const array = Array.from({ length }, (_, i) => BigInt(i));
    const nestedCoinCell = beginCell().storeRef(storeCoinsNested(array)).endCell();
    const parsedResult = parseCoinsFromNestedCell(nestedCoinCell.beginParse().loadRef());
    expect(parsedResult).toEqual(array);
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
    const nestedAssetCell = beginCell().storeRef(storeSortedAssetsNested(sortedArray)).endCell();
    const parsedResult = parseAssetsFromNestedCell(nestedAssetCell.beginParse().loadRef());
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

describe('Test Allocation Normalization', () => {
  const tstonAddr = Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav');
  const sttonAddr = Address.parse('EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k');
  const ton = Asset.ton();
  const tston = Asset.jetton(tstonAddr);
  const stton = Asset.jetton(sttonAddr);

  it('Should normalize allocations (expand 1 element to 3)', () => {
    const alloc = new Allocation({ asset: Asset.ton(), amount: BigInt(100) });
    const target = [ton, tston, stton].sort((a, b) => a.compare(b));
    const normalized = normalize(alloc, target);
    const expected = [
      new Allocation({ asset: ton, amount: 100n }),
      new Allocation({ asset: tston, amount: 0n }),
      new Allocation({ asset: stton, amount: 0n }),
    ].sort((a, b) => a.compare(b));
    expect(normalized).toEqual(expected);
  });

  it('Should normalize allocations (3 elements to 3)', () => {
    const alloc = Allocation.createAllocations([
      { asset: Asset.ton(), amount: BigInt(100) },
      { asset: Asset.jetton(Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav')), amount: BigInt(100) },
      { asset: Asset.jetton(Address.parse('EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k')), amount: BigInt(100) },
    ]);
    const target = [ton, tston, stton].sort((a, b) => a.compare(b));
    const normalized = normalize(alloc, target);
    expect(normalized).toEqual(alloc.sort((a, b) => a.compare(b)));
  });
});
