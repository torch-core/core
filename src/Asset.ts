import { beginCell, Cell } from '@ton/core';

import { Address } from '@ton/core';
import { z } from 'zod';

export enum AssetType {
  TON = 0,
  JETTON = 1,
  EXTRA_CURRENCY = 2,
}

export const AssetSchema = z
  .object({
    type: z.nativeEnum(AssetType),
    jettonMaster: z.instanceof(Address).optional(),
    currencyId: z.number().optional(),
  })
  .refine((data) => {
    if (data.type === AssetType.JETTON) {
      return data.jettonMaster !== undefined;
    }
    if (data.type === AssetType.EXTRA_CURRENCY) {
      return data.currencyId !== undefined;
    }
    return true;
  });

export class Asset implements z.infer<typeof AssetSchema> {
  type: AssetType;
  jettonMaster?: Address;
  currencyId?: number;

  constructor(params: z.input<typeof AssetSchema>) {
    const parsed = AssetSchema.parse(params);
    this.type = parsed.type;
    this.jettonMaster = parsed.jettonMaster;
    this.currencyId = parsed.currencyId;
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
  static jetton(jettonMaster: Address): Asset {
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

  toCell(): Cell {
    const cellBuilder = beginCell().storeUint(this.type, 4);
    switch (this.type) {
      case AssetType.TON:
        return cellBuilder.endCell();
      case AssetType.JETTON:
        return cellBuilder.storeAddress(this.jettonMaster!).endCell();
      case AssetType.EXTRA_CURRENCY:
        return cellBuilder.storeInt(this.currencyId!, 32).endCell();
    }
  }

  /**
   * The id of the asset.
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

  toJSON(): object {
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
}
