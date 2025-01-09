import { Address } from '@ton/core';
import { z } from 'zod';

/**
 * A schema for validating and transforming address inputs.
 *
 * This schema accepts either a non-empty string or an instance of the Address class.
 * If a string is provided, it is parsed into an Address instance.
 */
export const AddressSchema = z.union([z.string().nonempty(), z.instanceof(Address)]).transform((value) => {
  if (typeof value === 'string') {
    return Address.parse(value);
  }
  return value;
});
