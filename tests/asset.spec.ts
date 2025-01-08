import { Address, beginCell } from '@ton/core';
import { Asset, AssetType } from '../src';

describe('Asset', () => {
  it('Should create a TON asset', () => {
    const asset = Asset.ton();
    expect(asset).toBeDefined();
    expect(asset.type).toBe(AssetType.TON);
    expect(asset.ID).toBe('0');
  });

  it('Should create a Jetton asset', () => {
    const tston = 'EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav';
    const jettonAddr = Address.parse(tston);
    const asset = Asset.jetton(jettonAddr);
    expect(asset).toBeDefined();
    expect(asset.type).toBe(AssetType.JETTON);
    expect(asset.jettonMaster).toBe(jettonAddr);
    expect(asset.ID).toBe(`1:${tston}`);
  });

  it('Should sort assets in correct order (ton < stton < tston)', () => {
    const ton = Asset.ton();
    const tston = Asset.jetton(Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav'));
    const stton = Asset.jetton(Address.parse('EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k'));
    const sorted = [tston, stton, ton].sort((a, b) => a.compare(b));
    const tstonHash = BigInt(`0x${beginCell().storeAddress(tston.jettonMaster).endCell().hash().toString('hex')}`);
    const sttonHash = BigInt(`0x${beginCell().storeAddress(stton.jettonMaster).endCell().hash().toString('hex')}`);
    expect(sttonHash).toBeLessThan(tstonHash);
    expect(sorted.map((a) => a.ID)).toEqual([ton.ID, stton.ID, tston.ID]);
  });
});
