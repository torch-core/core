import { Address, beginCell } from '@ton/core';
import { Asset, AssetType } from '../src';

describe('Asset', () => {
  it('Should create raw address from string', () => {
    // Use TON
    const tonAsset = new Asset({ type: AssetType.TON });
    // Use string
    const jettonAsset1 = new Asset({
      type: AssetType.JETTON,
      jettonMaster: 'EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav',
    });
    // Use Address
    const jettonAsset2 = new Asset({
      type: AssetType.JETTON,
      jettonMaster: Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav'),
    });
    // Use extra currency
    const extraCurrencyAsset = new Asset({
      type: AssetType.EXTRA_CURRENCY,
      currencyId: 1,
    });
    expect(tonAsset.ID).toBe('0');
    expect(jettonAsset1.ID).toBe('1:EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav');
    expect(jettonAsset2.ID).toBe('1:EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav');
    expect(extraCurrencyAsset.ID).toBe('2:1');
  });

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

  it('Should convert asset between toJSON and fromJSON', () => {
    const jettonMaster = Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav');
    const original = Asset.jetton(jettonMaster);
    const json = original.toJSON();
    const transformed = Asset.fromJSON(json);
    expect(transformed.ID).toEqual(original.ID);
  });

  it('Should convert asset between toCell and fromCell', () => {
    const jettonMaster = Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav');
    const original = Asset.jetton(jettonMaster);
    const cell = original.toCell();
    const transformed = Asset.fromCell(cell);
    expect(transformed.ID).toEqual(original.ID);
  });

  it('Should convert asset between ID and fromID', () => {
    const jettonMaster = Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav');
    const original = Asset.jetton(jettonMaster);
    const id = original.ID;
    const transformed = Asset.fromID(id);
    expect(transformed.ID).toEqual(original.ID);
    expect(transformed.type).toEqual(original.type);
    expect(transformed.jettonMaster?.toString()).toEqual(original.jettonMaster?.toString());
  });
});
