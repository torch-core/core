import { Cell } from '@ton/core';
/**
 * A comparable object is an object that can be compared to another object, usually used for sorting.
 * [comparableA, comparableB].sort((a, b) => a.compare(b))
 */
export interface Comparable {
  /**
   * Compares the current object with another object.
   * @param other - The other object.
   * @returns A number indicating the order:
   * - Negative if this object is less than the other.
   * - Zero if they are equal.
   * - Positive if this object is greater than the other.
   */
  compare(other: Comparable): number;
}

/**
 * A cellable object is an object that can be serialized into a Cell object,
 * usually paired with a `fromCell` function to deserialize the Cell object back into the object.
 */
export interface Cellable {
  /**
   * Serializes the object into a Cell object.
   * @returns The serialized Cell representation of the object.
   */
  toCell(): Cell;
}

/**
 * A marshallable object is an object that can be serialized into a JSON object.
 * Usually paired with a `fromJSON` function to deserialize the JSON object back into the object.
 */
export interface Marshallable {
  /**
   * Converts the current object to a JSON object.
   * @returns A JSON representation of the object.
   */
  toJSON(): Record<string, unknown>;
}
