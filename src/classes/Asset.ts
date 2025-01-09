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
 */
export const AssetSchema = z.union([
  z.object({ type: z.literal(AssetType.TON) }),
  z.object({ type: z.literal(AssetType.JETTON), jettonMaster: AddressSchema }),
  z.object({ type: z.literal(AssetType.EXTRA_CURRENCY), currencyId: z.number() }),
]);

/**
 * Class representing an asset. Supports TON, Jetton, and Extra Currency.
 * Implements `Marshallable`, `Comparable`, and `Cellable` interfaces.
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
   */
  get ID(): string {
    switch (this.type) {
      case AssetType.TON:
        return `${AssetType.TON}`;
      case AssetType.JETTON:
        if (!this.jettonMaster) throw new Error('Jetton master address is missing');
        return `${AssetType.JETTON}:${this.jettonMaster!.toString()}`;
      case AssetType.EXTRA_CURRENCY:
        if (this.currencyId === undefined) throw new Error('Currency ID is missing');
        return `${AssetType.EXTRA_CURRENCY}:${this.currencyId!}`;
    }
  }

  static fromID(id: string): Asset {
    const [type, value] = id.split(':', 2);
    if (!type || !value) throw new Error('Invalid asset ID');
    const typeNumber = Number(type);
    switch (typeNumber) {
      case AssetType.TON:
        return Asset.ton();
      case AssetType.JETTON:
        return Asset.jetton(Address.parse(value));
      case AssetType.EXTRA_CURRENCY:
        return Asset.extraCurrency(Number(value));
      default:
        throw new Error('Invalid asset ID');
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

  toJSON() {
    switch (this.type) {
      case AssetType.TON:
        return { type: this.type };
      case AssetType.JETTON:
        return {
          type: this.type,
          jettonMaster: this.jettonMaster!.toString(),
        };
      case AssetType.EXTRA_CURRENCY:
        return { type: this.type, currencyId: this.currencyId };
    }
  }

  static fromJSON(json: Record<string, unknown>): Asset {
    return new Asset(json as z.infer<typeof AssetSchema>);
  }
}
