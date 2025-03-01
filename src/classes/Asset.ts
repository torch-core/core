import { beginCell, Cell } from '@ton/core';
import { Address } from '@ton/core';
import { Cellable, Comparable, Marshallable } from '../interfaces';
import { z } from 'zod';
import { AddressSchema } from './Address';

/**
 * Enumeration for asset types.
 * - `TON (0)`: Represents the TON asset.
 * - `JETTON (1)`: Represents a Jetton asset, requiring a `jettonMaster` address.
 * - `EXTRA_CURRENCY (2)`: Represents an extra currency, requiring a `currencyId`.
 */
export enum AssetType {
  TON = 0,
  JETTON = 1,
  EXTRA_CURRENCY = 2,
}

/**
 * Schema definition for the Asset class.
 * Validates the structure and constraints of an Asset instance.
 *
 * The schema uses a discriminated union based on the `type` property.
 * Depending on the value of `type`, the structure of the object changes:
 *
 * - `AssetType.TON`: Represents a TON asset with no additional fields.
 * - `AssetType.JETTON`: Represents a Jetton asset with a `jettonMaster` address.
 * - `AssetType.EXTRA_CURRENCY`: Represents an extra currency asset with a `currencyId`.
 *
 * ### Examples:
 *
 * TON Asset:
 * @example
 * const tonAsset = { type: AssetType.TON };
 *
 * Jetton Asset:
 * @example
 * const jettonAsset = {
 *   type: AssetType.JETTON,
 *   jettonMaster: "EQC6...validAddress",
 * };
 *
 * Extra Currency Asset:
 * @example
 * const extraCurrencyAsset = {
 *   type: AssetType.EXTRA_CURRENCY,
 *   currencyId: 123,
 * };
 *
 * ### Equivalent TypeScript Interface:
 * @example
 * export type Asset =
 *   | { type: AssetType.TON }
 *   | { type: AssetType.JETTON; jettonMaster: string }
 *   | { type: AssetType.EXTRA_CURRENCY; currencyId: number };
 */
export const AssetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal(AssetType.TON) }),
  z.object({ type: z.literal(AssetType.JETTON), jettonMaster: AddressSchema }),
  z.object({ type: z.literal(AssetType.EXTRA_CURRENCY), currencyId: z.number() }),
]);

/**
 * Class representing an asset. Supports TON, Jetton, and Extra Currency.
 * Implements `Marshallable`, `Comparable`, and `Cellable` interfaces.
 *
 * @example
 * const tonAsset = Asset.ton()
 * const jettonAsset = Asset.jetton("EQC6...validAddress")
 * const jettonAsset = Asset.jetton(Address.parse("EQC6...validAddress"))
 */
export class Asset implements Marshallable, Comparable, Cellable {
  type: AssetType;
  jettonMaster?: Address;
  currencyId?: number;

  constructor(params: z.input<typeof AssetSchema>) {
    const parsed = AssetSchema.parse(params);
    this.type = parsed.type;
    if (parsed.type === AssetType.JETTON) {
      this.jettonMaster = parsed.jettonMaster;
    } else if (parsed.type === AssetType.EXTRA_CURRENCY) {
      this.currencyId = parsed.currencyId;
    }
  }

  /**
   * @returns Asset instance with ton prefix (0)
   */
  static ton(): Asset {
    return new Asset({ type: AssetType.TON });
  }

  /**
   *
   * @param jettonMaster jetton master address
   * @returns Asset instance with jetton prefix (1)
   */
  static jetton(jettonMaster: z.input<typeof AddressSchema>): Asset {
    return new Asset({ type: AssetType.JETTON, jettonMaster });
  }

  /**
   *
   * @param currencyId currency id (int32)
   * @returns Asset instance with currency prefix (2)
   */
  static extraCurrency(currencyId: number): Asset {
    return new Asset({ type: AssetType.EXTRA_CURRENCY, currencyId });
  }

  /**
   * Serializes the current asset to a Cell object.
   * @returns The serialized Cell object.
   */
  toCell(): Cell {
    switch (this.type) {
      case AssetType.TON:
        return beginCell().storeUint(this.type, 4).endCell();
      case AssetType.JETTON:
        return beginCell().storeUint(this.type, 4).storeAddress(this.jettonMaster).endCell();
      case AssetType.EXTRA_CURRENCY:
        return beginCell().storeUint(this.type, 4).storeInt(this.currencyId!, 32).endCell();
    }
  }

  /**
   * Deserializes a Cell object into an Asset instance.
   * @param c - The serialized Cell object.
   * @returns The deserialized Asset instance.
   */
  static fromCell(c: Cell): Asset {
    const sc = c.beginParse();
    const prefix = sc.loadUint(4);
    switch (prefix) {
      case AssetType.TON: {
        return Asset.ton();
      }
      case AssetType.JETTON: {
        const jettonMaster = sc.loadAddress();
        return Asset.jetton(jettonMaster);
      }
      case AssetType.EXTRA_CURRENCY: {
        const currencyId = sc.loadUint(32);
        return Asset.extraCurrency(currencyId);
      }
      default: {
        throw new Error('Invalid asset prefix');
      }
    }
  }

  /**
   * Unique identifier of the asset.
   * TON: 0
   * JETTON: '1:{jettonMaster}'
   * ExtraCurrency: '2:{currencyId}'
   *
   * @example
   * expect(Asset.ton().ID).toBe('0')
   * expect(Asset.jetton(Address.parse("EQC6...validAddress")).ID).toBe('1:EQC6...validAddress')
   * expect(Asset.extraCurrency(123).ID).toBe('2:123')
   */
  get ID(): string {
    switch (this.type) {
      case AssetType.TON:
        return `${AssetType.TON}`;
      case AssetType.JETTON:
        if (!this.jettonMaster) throw new Error('Jetton master address is missing');
        return `${AssetType.JETTON}:${this.jettonMaster!.toRawString()}`;
      case AssetType.EXTRA_CURRENCY:
        if (this.currencyId === undefined) throw new Error('Currency ID is missing');
        return `${AssetType.EXTRA_CURRENCY}:${this.currencyId!}`;
    }
  }

  /**
   * Deserializes an asset ID string into an Asset instance.
   * @param id - The asset ID string.
   * @returns The deserialized Asset instance.
   *
   * @example
   * const asset = Asset.fromID('1:EQC6...validAddress')
   * expect(asset.type).toBe(AssetType.JETTON)
   * expect(asset.jettonMaster).toBe(Address.parse("EQC6...validAddress"))
   */
  static fromID(id: string): Asset {
    const [type, ...rest] = id.split(':');
    const value = rest.join(':');
    if (!type) throw new Error('Invalid asset type');
    const typeNumber = Number(type);
    switch (typeNumber) {
      case AssetType.TON:
        return Asset.ton();
      case AssetType.JETTON:
        if (!value) throw new Error('Invalid asset value');
        return Asset.jetton(Address.parse(value));
      case AssetType.EXTRA_CURRENCY:
        if (!value) throw new Error('Invalid asset value');
        return Asset.extraCurrency(Number(value));
      default:
        throw new Error('Invalid asset type: ' + type);
    }
  }

  /**
   * Compares the current asset with another asset for equality.
   * @param other - The other Asset instance.
   * @returns `true` if both assets are equal; otherwise, `false`.
   */
  equals(other: Asset): boolean {
    return this.compare(other) === 0;
  }

  /**
   * Compares the current asset with another asset for ordering, i.e.
   * - 0: equal
   * - 1: this is greater than other
   * - -1: this is less than other
   * @param other - The other Asset instance.
   * @returns A number indicating the comparison result.
   *
   * @example
   * assets = [Asset.ton(), Asset.jetton(Address.parse("EQC6...validAddress")), Asset.extraCurrency(123)]
   * assets.sort((a, b) => a.compare(b))
   */
  compare(other: Asset): number {
    if (other.type != this.type) {
      return this.type - other.type;
    }

    if (this.type === AssetType.JETTON) {
      const thisHash = BigInt(`0x${beginCell().storeAddress(this.jettonMaster).endCell().hash().toString('hex')}`);
      const otherHash = BigInt(`0x${beginCell().storeAddress(other.jettonMaster).endCell().hash().toString('hex')}`);

      return Number(thisHash - otherHash);
    }

    if (this.type === AssetType.EXTRA_CURRENCY) {
      throw new Error('Extra currency asset is not supported yet');
    }

    return 0;
  }

  /**
   * Serializes the current asset to a JSON object.
   * @returns A JSON object representing the asset.
   *
   * @example
   * const asset = Asset.ton()
   * const json = asset.toJSON()
   * expect(json).toEqual({ type: 0 })
   *
   * const jettonAsset = Asset.jetton(Address.parse("EQC6...validAddress"))
   * const json = jettonAsset.toJSON()
   * expect(json).toEqual({ type: 1, jettonMaster: "EQC6...validAddress" })
   *
   * const extraCurrencyAsset = Asset.extraCurrency(123)
   * const json = extraCurrencyAsset.toJSON()
   * expect(json).toEqual({ type: 2, currencyId: 123 })
   */
  toJSON(): Record<string, unknown> {
    switch (this.type) {
      case AssetType.TON:
        return { type: this.type };
      case AssetType.JETTON:
        return {
          type: this.type,
          jettonMaster: this.jettonMaster!.toRawString(),
        };
      case AssetType.EXTRA_CURRENCY:
        return { type: this.type, currencyId: this.currencyId };
    }
  }

  /**
   * Deserializes a JSON object into an Asset instance.
   * @param json - The JSON object.
   * @returns The deserialized Asset instance.
   *
   * @example
   * const asset = Asset.fromJSON({ type: 1, jettonMaster: "EQC6...validAddress" })
   * expect(asset.type).toBe(AssetType.JETTON)
   * expect(asset.jettonMaster).toBe(Address.parse("EQC6...validAddress"))
   */
  static fromJSON(json: Record<string, unknown>): Asset {
    return new Asset(json as z.infer<typeof AssetSchema>);
  }
}
