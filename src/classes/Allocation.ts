import { z } from 'zod';
import { Asset, AssetSchema } from './Asset';
import { Comparable, Marshallable } from '../interfaces';

/**
 * A schema for validating and transforming allocation inputs.
 *
 * This schema defines the structure of an allocation object, which includes:
 *
 * - `asset`:
 *   - Can be an instance of the `Asset` class.
 *   - Can be an object conforming to `AssetSchema`, which is transformed into an `Asset` instance.
 * - `value`:
 *   - Can be a non-negative `bigint`.
 *   - Can be a non-negative `number` (transformed into `bigint`).
 *   - Can be a `string` (transformed into `bigint`).
 *
 * ### Examples:
 * Allocation with an existing Asset instance:
 * @example
 * const allocation = {
 *   asset: new Asset({ type: AssetType.TON }),
 *   value: 100n,
 * };
 *
 * Allocation with an AssetSchema object:
 * @example
 * const allocation = {
 *   asset: { type: AssetType.JETTON, jettonMaster: "EQC6...validAddress" },
 *   value: "1000",
 * };
 *
 * Allocation with a number as the value:
 * @example
 * const allocation = {
 *   asset: { type: AssetType.EXTRA_CURRENCY, currencyId: 123 },
 *   value: 5000,
 * };
 *
 * ### Equivalent TypeScript Interface:
 * @example
 * export interface Allocation {
 *   asset: Asset
 *   | { type: AssetType.TON }
 *   | { type: AssetType.JETTON; jettonMaster: string }
 *   | { type: AssetType.EXTRA_CURRENCY; currencyId: number };
 *   value: bigint;
 * }
 */
export const AllocationSchema = z.object({
  asset: z.union([z.instanceof(Asset), AssetSchema.transform((asset) => new Asset(asset))]),
  value: z.union([
    z.bigint().nonnegative(),
    z
      .number()
      .nonnegative()
      .transform((num) => BigInt(num)),
    z.string().transform((str) => BigInt(str)),
  ]),
});

/**
 * Represents an allocation of a specific asset and value.
 * Implements the Marshallable and Comparable interfaces.
 */
export class Allocation implements z.infer<typeof AllocationSchema>, Marshallable, Comparable {
  asset: Asset;
  value: bigint;

  constructor(params: z.input<typeof AllocationSchema>) {
    const parsed = AllocationSchema.parse(params);
    this.asset = parsed.asset;
    this.value = parsed.value;
  }

  /**
   * Creates multiple Allocation instances from an input or array of inputs.
   * @param input - A single input or an array of inputs to create allocations from.
   * @returns An array of Allocation instances.
   *
   * @example
   * const allocations = Allocation.createAllocations([
   *   { asset: Asset.ton(), value: 100n },
   *   { asset: Asset.jetton(Address.parse("EQC6...validAddress")), value: 100n },
   *   { asset: { type: AssetType.EXTRA_CURRENCY, currencyId: 123 }, value: 100n },
   * ])
   * expect(allocations.length).toBe(3)
   *
   * @example
   * const allocations = Allocation.createAllocations({ asset: Asset.ton(), value: 100n })
   * expect(allocations.length).toBe(1)
   */
  static createAllocations(input: z.input<typeof AllocationSchema> | z.input<typeof AllocationSchema>[]): Allocation[] {
    const allocs = Array.isArray(input) ? input : [input];
    return allocs.map((alloc) => new Allocation(alloc));
  }

  /**
   * Compares this allocation with another allocation.
   * @param other - The other allocation to compare against.
   * @returns A number indicating the comparison result.
   */
  compare(other: Allocation): number {
    return this.asset.compare(other.asset);
  }

  /**
   * Converts the allocation to a JSON object.
   * @returns A JSON representation of the allocation.
   */
  toJSON() {
    return {
      asset: this.asset.toJSON(),
      value: this.value.toString(),
    };
  }

  static fromJSON(json: Record<string, unknown>) {
    return new Allocation(json as z.input<typeof AllocationSchema>);
  }
}
