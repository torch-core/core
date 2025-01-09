import { Cell } from '@ton/core';

export interface Comparable {
  /**
   * Compares the current asset with another asset.
   * @param other - The other Asset instance.
   * @returns A number indicating the order:
   * - Negative if this asset is less than the other.
   * - Zero if they are equal.
   * - Positive if this asset is greater than the other.
   */
  compare(other: Comparable): number;
}

export interface Cellable {
  /**
   * Serializes the asset into a Cell object.
   * @returns The serialized Cell representation of the asset.
   */
  toCell(): Cell;
}

export interface Marshallable {
  /**
   * Converts the current instance to a JSON object.
   * @returns A JSON representation of the instance.
   */
  toJSON(): Record<string, unknown>;
}
