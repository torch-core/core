import { z } from 'zod';
import { Cellable, Marshallable } from '../interfaces';
import { Allocation, AllocationSchema } from './Allocation';
import { beginCell, Cell } from '@ton/core';
import {
  parseAssetsFromNestedCell,
  parseCoinsFromNestedCell,
  storeCoinsNested,
  storeSortedAssetsNested,
} from '../utils';
import { sign } from '@ton/crypto';

/**
 * Schema for validating the RatePayload structure.
 *
 * This schema ensures the `RatePayload` object contains:
 * - `expiration`: A positive number indicating the expiration time. (uint32)
 * - `rates`: An array of `Allocation` objects or valid `AllocationSchema` entries,
 *   representing relative prices between assets.
 *
 * ### Examples:
 *
 * Using Allocation.createAllocations:
 * @example
 * const ratePayload = {
 *   expiration: 3600,
 *   rates: Allocation.createAllocations([
 *     { asset: Asset.ton(), amount: 100n },
 *     { asset: Asset.jetton(Address.parse("EQC6...validAddress")), amount: 200n },
 *   ]),
 * };
 *
 * Using AllocationSchema entries:
 * @example
 * const ratePayload = {
 *   expiration: 3600,
 *   rates: [
 *     { asset: Asset.ton(), amount: "100" },
 *     { asset: Asset.extraCurrency(123), amount: 2000 },
 *   ],
 * };
 *
 * ### Equivalent TypeScript Interface:
 * @example
 * export interface RatePayload {
 *   expiration: number; // Positive number representing the expiration time.
 *   rates: Allocation[]; // Array of Allocation instances.
 * }
 */
export const RatePayloadSchema = z.object({
  expiration: z.number().positive(),
  rates: z.union([
    z.array(z.instanceof(Allocation)),
    z.array(AllocationSchema).transform((rates) => rates.map((rate) => new Allocation(rate))),
  ]),
});

/**
 * Class representing a payload of rates with an expiration time.
 * Implements `Marshallable` and `Cellable` interfaces.
 */
export class RatePayload implements z.infer<typeof RatePayloadSchema>, Marshallable, Cellable {
  expiration: number;
  rates: Allocation[];

  constructor(params: z.input<typeof RatePayloadSchema>) {
    const parsed = RatePayloadSchema.parse(params);
    this.expiration = parsed.expiration;
    this.rates = parsed.rates.sort((a, b) => a.compare(b));
  }
  /**
   * Signs the payload using the provided secret key.
   * @param secretKey - The secret key to sign the payload.
   * @returns A promise resolving to the signature buffer.
   *
   * @example
   * const mnemonic = await mnemonicNew();
   * const keypair = await mnemonicToWalletKey(mnemonic);
   * const tritonRates = Allocation.createAllocations([ // Just an example
   *   { asset: Asset.ton(), amount: 1000000000000000000n },
   *   { asset: Asset.jetton("tston address"), amount: 1040000000000000000n },
   * ])
   * const ratePayload = new RatePayload({ expiration, rates: tritonRates });
   * const signature = await ratePayload.sign(keypair.secretKey);
   * expect(signature).toBeDefined()
   */
  async sign(secretKey: Buffer<ArrayBufferLike>): Promise<Buffer> {
    return sign(this.toCell().hash(), secretKey);
  }

  /**
   * Serializes the current RatePayload instance to a Cell object.
   * @returns The serialized Cell object.
   */
  toCell(): Cell {
    const assets = this.rates.map((rate) => rate.asset);
    const values = this.rates.map((rate) => rate.value);

    return beginCell()
      .storeUint(this.expiration, 32)
      .storeRef(storeSortedAssetsNested(assets))
      .storeRef(storeCoinsNested(values))
      .endCell();
  }

  /**
   * Deserializes a Cell object into a RatePayload instance.
   * @param c - The serialized Cell object.
   * @returns The deserialized RatePayload instance.
   * @throws If the assets and values arrays have mismatched lengths.
   */
  static fromCell(c: Cell): RatePayload {
    const cs = c.beginParse();
    const expiration = cs.loadUint(32);
    const assets = parseAssetsFromNestedCell(cs.loadRef());
    const values = parseCoinsFromNestedCell(cs.loadRef());

    if (assets.length !== values.length) {
      throw new Error('Assets and values length mismatch');
    }

    const rates = assets.map((asset, index) => {
      const value = values[index];
      if (value === undefined) {
        throw new Error(`Missing value for asset at index ${index}`);
      }
      return new Allocation({ asset, value });
    });

    return new RatePayload({ expiration, rates });
  }

  /**
   * Serializes the current RatePayload instance to a JSON object.
   * @returns The serialized JSON object.
   */
  toJSON(): Record<string, unknown> {
    return {
      expiration: this.expiration,
      rates: this.rates.map((rate) => rate.toJSON()),
    };
  }

  /**
   * Deserializes a JSON object into a RatePayload instance.
   * @param json - The serialized JSON object.
   * @returns The deserialized RatePayload instance.
   */
  static fromJSON(json: Record<string, unknown>): RatePayload {
    return new RatePayload(json as never);
  }
}

/**
 * Class representing a signed rate, linking to optional next signed rates.
 * Implements `Marshallable` and `Cellable` interfaces.
 */
export class SignedRate implements Marshallable, Cellable {
  signature: Buffer;
  payload: RatePayload;
  nextSignedRate?: SignedRate | undefined | null;

  constructor(params: { signature: Buffer; payload: RatePayload; nextSignedRate?: SignedRate | undefined | null }) {
    this.signature = params.signature;
    this.payload = params.payload;
    this.nextSignedRate = params.nextSignedRate;
  }

  /**
   * Creates a chain of SignedRate instances from an array of RatePayloads.
   * @param rates - The array of RatePayload instances.
   * @param secretKey - The secret key for signing each RatePayload.
   * @returns A promise resolving to the first SignedRate in the chain.
   * @throws If the `rates` array is empty.
   *
   * @example
   * const mnemonic = await mnemonicNew();
   * const keypair = await mnemonicToWalletKey(mnemonic);
   * // first we create the rates, the transaction order is triton, then meta.
   * const tritonRates = Allocation.createAllocations([
   *   { asset: Asset.ton(), amount: 1000000000000000000n },
   *   { asset: Asset.jetton("tston address"), amount: 1040000000000000000n },
   *   { asset: Asset.jetton("stton address"), amount: 1050000000000000000n },
   * ])
   * const metaRates = Allocation.createAllocations([
   *   { asset: Asset.ton(), amount: 100n },
   *   { asset: hton, amount: 106n },
   * ])
   * const tritonRatePayload = new RatePayload({ expiration, rates: tritonRates });
   * const metaRatePayload = new RatePayload({ expiration, rates: metaRates });
   * // Recursively create the signed rates
   * const signedRate = await SignedRate.fromRates([tritonRatePayload, metaRatePayload], keypair.secretKey);
   * expect(signedRate).toBeDefined()
   */
  static async fromRates(rates: RatePayload[], secretKey: Buffer<ArrayBufferLike>): Promise<SignedRate> {
    if (rates.length === 0) {
      throw new Error('Rates array is empty');
    }

    // This will hold the most recently created SignedRate
    let prevSignedRate: SignedRate | undefined = undefined;

    // Traverse the rates array in reverse
    for (let i = rates.length - 1; i >= 0; i--) {
      const payload = rates[i];
      if (payload) {
        const signature = await payload.sign(secretKey); // Asynchronously sign the payload
        const currentRate: SignedRate = new SignedRate({
          signature,
          payload,
          nextSignedRate: prevSignedRate, // Link to the previous SignedRate
        });
        prevSignedRate = currentRate; // Update prevSignedRate for the next iteration
      }
    }

    // Return the first SignedRate (which is the last processed in reverse traversal)
    return prevSignedRate as SignedRate;
  }

  /**
   * Deserializes a Cell object into a SignedRate instance.
   * @param c - The serialized Cell object.
   * @returns The deserialized SignedRate instance.
   */
  static fromCell(c: Cell): SignedRate {
    const cs = c.beginParse();
    const signature = cs.loadBuffer(64);
    const payload = RatePayload.fromCell(cs.loadRef());
    const nextSignedRateCell = cs.loadMaybeRef();
    let nextSignedRate = undefined;
    if (nextSignedRateCell) {
      nextSignedRate = SignedRate.fromCell(nextSignedRateCell);
    }
    return new SignedRate({ signature, payload, nextSignedRate });
  }

  /**
   * Serializes the current SignedRate instance to a Cell object.
   * @returns The serialized Cell object.
   */
  toCell(): Cell {
    return beginCell()
      .storeBuffer(this.signature, 64)
      .storeRef(this.payload.toCell())
      .storeMaybeRef(this.nextSignedRate ? this.nextSignedRate.toCell() : undefined)
      .endCell();
  }

  /**
   * Serializes the current SignedRate instance to a JSON object.
   * @returns The serialized JSON object.
   */
  toJSON(): Record<string, unknown> {
    return {
      signature: this.signature.toString('hex'),
      payload: this.payload.toJSON(),
      nextSignedRate: this.nextSignedRate?.toJSON(),
    };
  }

  /**
   * Deserializes a JSON object into a SignedRate instance.
   * @param json - The serialized JSON object.
   * @returns The deserialized SignedRate instance.
   */
  static fromJSON(json: Record<string, unknown>): SignedRate {
    return new SignedRate({
      signature: Buffer.from(json.signature as string, 'hex'),
      payload: RatePayload.fromJSON(json.payload as Record<string, unknown>),
      nextSignedRate: json.nextSignedRate
        ? SignedRate.fromJSON(json.nextSignedRate as Record<string, unknown>)
        : undefined,
    });
  }
}
