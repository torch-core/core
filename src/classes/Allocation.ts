import { z } from 'zod';
import { Asset, AssetSchema } from './Asset';
import { Comparable, Marshallable } from '../interfaces';

/**
 * A schema for validating and transforming allocation inputs.
 *
 * This schema defines the structure of an allocation object, which includes:
 * - `asset`: Can be an instance of the Asset class or a valid AssetSchema object
 *   that is transformed into an Asset instance.
 * - `amount`: Can be a non-negative bigint, a non-negative number (transformed to bigint),
 *   or a string (transformed to bigint).
 */
export const AllocationSchema = z.object({
  asset: z.union([z.instanceof(Asset), AssetSchema.transform((asset) => new Asset(asset))]),
  amount: z.union([
    z.bigint().nonnegative(),
    z
      .number()
      .nonnegative()
      .transform((num) => BigInt(num)),
    z.string().transform((str) => BigInt(str)),
  ]),
});

/**
 * Represents an allocation of a specific asset and amount.
 * Implements the Marshallable and Comparable interfaces.
 */
export class Allocation implements z.infer<typeof AllocationSchema>, Marshallable, Comparable {
  asset: Asset;
  amount: bigint;

  constructor(params: z.input<typeof AllocationSchema>) {
    const parsed = AllocationSchema.parse(params);
    this.asset = parsed.asset;
    this.amount = parsed.amount;
  }

  /**
   * Creates multiple Allocation instances from an input or array of inputs.
   * @param input - A single input or an array of inputs to create allocations from.
   * @returns An array of Allocation instances.
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
      amount: this.amount.toString(),
    };
  }

  static fromJSON(json: Record<string, unknown>) {
    return new Allocation(json as z.input<typeof AllocationSchema>);
  }
}
