import { RatePayload, SignedRate } from '../src';
import { Asset } from '../src';
import { Allocation } from '../src';
import { Address } from '@ton/core';
import { mnemonicToWalletKey, mnemonicNew, signVerify } from '@ton/crypto';

describe('RatePayload and SignedRate', () => {
  const expiration = Math.floor(Date.now() / 1000) + 10 * 60;
  const tston = Asset.jetton(Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav'));
  const stton = Asset.jetton(Address.parse('EQDNhy-nxYFgUqzfUzImBEP67JqsyMIcyk2S5_RwNNEYku0k'));
  const hton = Asset.jetton(Address.parse('EQDPdq8xjAhytYqfGSX8KcFWIReCufsB9Wdg0pLlYSO_h76w'));
  const tritonRates = Allocation.createAllocations([
    { asset: Asset.ton(), value: 100n },
    { asset: tston, value: 104n },
    { asset: stton, value: 105n },
  ]);
  const metaRates = Allocation.createAllocations([
    { asset: Asset.ton(), value: 100n },
    { asset: hton, value: 106n },
  ]);

  it('Should convert JSON between RatePayload', () => {
    const rate1 = new RatePayload({ expiration, rates: tritonRates });
    const json = rate1.toJSON();
    const rate2 = RatePayload.fromJSON(json);
    expect(rate2.expiration).toEqual(rate1.expiration);
    expect(JSON.stringify(rate2.rates)).toEqual(JSON.stringify(rate1.rates));
  });

  it('Should convert Cell between RatePayload', () => {
    const rate1 = new RatePayload({ expiration, rates: tritonRates });
    const cell = rate1.toCell();

    const rate2 = RatePayload.fromCell(cell);
    expect(rate2.expiration).toEqual(rate1.expiration);
    expect(JSON.stringify(rate2.rates)).toEqual(JSON.stringify(rate1.rates));
  });

  it('Should sign and verify RatePayload', async () => {
    const mnemonic = await mnemonicNew();
    const keypair = await mnemonicToWalletKey(mnemonic);

    const rate = new RatePayload({ expiration, rates: tritonRates });
    const signature = await rate.sign(keypair.secretKey);
    const verified = signVerify(rate.toCell().hash(), signature, keypair.publicKey);
    expect(verified).toBe(true);
  });

  describe('Should create SignedRates from Rates', () => {
    const tritonRatePayload = new RatePayload({ expiration, rates: tritonRates });
    const metaRatePayload = new RatePayload({ expiration, rates: metaRates });

    async function createSignedRate() {
      const mnemonic = await mnemonicNew();
      const keypair = await mnemonicToWalletKey(mnemonic);
      const signedRate = await SignedRate.fromRates([tritonRatePayload, metaRatePayload], keypair.secretKey);
      return { signedRate, keypair };
    }

    it('Should create SignedRates from Rates', async () => {
      const { signedRate } = await createSignedRate();
      expect(JSON.stringify(signedRate.payload)).toEqual(JSON.stringify(tritonRatePayload));
      expect(JSON.stringify(signedRate.nextSignedRate?.payload)).toEqual(JSON.stringify(metaRatePayload));
    });

    it('Should convert JSON between SignedRates', async () => {
      const { signedRate } = await createSignedRate();
      const json = signedRate.toJSON();
      const signedRate2 = SignedRate.fromJSON(json);
      expect(JSON.stringify(signedRate2.payload)).toEqual(JSON.stringify(tritonRatePayload));
      expect(JSON.stringify(signedRate2.nextSignedRate?.payload)).toEqual(JSON.stringify(metaRatePayload));
    });

    it('Should convert Cell between SignedRates', async () => {
      const { signedRate } = await createSignedRate();
      const cell = signedRate.toCell();
      const signedRate2 = SignedRate.fromCell(cell);
      expect(JSON.stringify(signedRate2.payload)).toEqual(JSON.stringify(tritonRatePayload));
      expect(JSON.stringify(signedRate2.nextSignedRate?.payload)).toEqual(JSON.stringify(metaRatePayload));
    });
  });
});
