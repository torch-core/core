import { Address } from '@ton/core';
import { Allocation, Asset } from '../src';

describe('Allocation', () => {
  const ton = Asset.ton();
  const tston = Asset.jetton(Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav'));
  const stton = Asset.jetton(Address.parse('EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k'));

  it('Should create allocation', () => {
    const allocation1 = new Allocation({
      asset: ton,
      value: 100n,
    });
    expect(allocation1.asset).toEqual(ton);
    expect(allocation1.value).toEqual(100n);

    const allocation2 = new Allocation(allocation1);
    expect(allocation2.asset).toEqual(ton);
    expect(allocation2.value).toEqual(100n);
  });

  it('Should create allocation array', () => {
    const allocations = Allocation.createAllocations([
      { asset: ton, value: 100n },
      { asset: tston, value: 104n },
      { asset: stton, value: 105n },
    ]);

    expect(allocations).toHaveLength(3); // Need to add this line to prevent from TS2532: Object is possibly 'undefined
    expect(allocations[0]?.asset).toEqual(ton);
    expect(allocations[0]?.value).toEqual(100n);
  });

  it('Should create allocation from JSON', () => {
    const allocation = Allocation.fromJSON({ asset: ton, value: 100n });
    expect(allocation.asset).toEqual(ton);
    expect(allocation.value).toEqual(100n);
  });
});
