import { Address } from '@ton/core';
import { z } from 'zod';

/**
 * A schema for validating and transforming address inputs.
 *
 * This schema supports two types of inputs:
 * - A non-empty string, which is transformed into an `Address` instance using `Address.parse`.
 * - An existing `Address` instance.
 *
 * ### Examples:
 * Using a valid string address:
 * @example
 * const address = "EQC6...validAddress"; // Valid TON address as a string
 * const parsedAddress = AddressSchema.parse(address); // Transformed to an Address instance
 *
 * Using an existing Address instance:
 * @example
 * const addressInstance = new Address("EQC6...validAddress");
 * const result = AddressSchema.parse(addressInstance); // Remains as Address instance
 *
 * ### Equivalent TypeScript Type:
 * @example
 * string | Address;
 */
export const AddressSchema = z.union([
  z
    .string()
    .nonempty()
    .transform((src) => Address.parse(src)),
  z.instanceof(Address),
]);
