import { Address } from '@ton/core';
import { Allocation, Asset } from '../src';

describe('Allocation', () => {
  const ton = Asset.ton();
  const tston = Asset.jetton(Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav'));
  const stton = Asset.jetton(Address.parse('EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k'));

  it('Should create allocation', () => {
    const allocation1 = new Allocation({
      asset: ton,
      amount: 100n,
    });
    expect(allocation1.asset).toEqual(ton);
    expect(allocation1.amount).toEqual(100n);

    const allocation2 = new Allocation(allocation1);
    expect(allocation2.asset).toEqual(ton);
    expect(allocation2.amount).toEqual(100n);
  });

  it('Should create allocation array', () => {
    const allocation = Allocation.createAllocations([
      { asset: ton, amount: 100n },
      { asset: tston, amount: 104n },
      { asset: stton, amount: 105n },
    ]);
    expect(allocation.length).toEqual(3);
    expect(allocation[0].asset).toEqual(ton);
    expect(allocation[0].amount).toEqual(100n);
  });

  it('Should create allocation from JSON', () => {
    const allocation = Allocation.fromJSON({ asset: ton, amount: 100n });
    expect(allocation.asset).toEqual(ton);
    expect(allocation.amount).toEqual(100n);
  });
});
