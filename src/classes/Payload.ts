import { beginCell, Cell } from '@ton/core';

import { z } from 'zod';
import { AddressSchema } from './Address';
import { Address } from '@ton/core';
import { Cellable, Marshallable } from '../interfaces';

export const CallbackPayloadSchema = z.object({
  receiver: z.union([z.instanceof(Address), AddressSchema]),
  value: z.union([
    z.bigint().nonnegative(),
    z
      .number()
      .nonnegative()
      .transform((src) => BigInt(src)),
    z.string().transform((src) => BigInt(src)),
  ]),
  payload: z.instanceof(Cell).optional(),
});

export class CallbackPayload implements z.infer<typeof CallbackPayloadSchema>, Marshallable, Cellable {
  receiver: Address;
  value: bigint;
  payload?: Cell;

  constructor(params: z.input<typeof CallbackPayloadSchema>) {
    const parsed = CallbackPayloadSchema.parse(params);
    this.receiver = parsed.receiver;
    this.value = parsed.value;
    this.payload = parsed.payload;
  }

  toCell(): Cell {
    return beginCell().storeAddress(this.receiver).storeCoins(this.value).storeMaybeRef(this.payload).endCell();
  }

  toJSON(): Record<string, unknown> {
    return {
      receiver: this.receiver.toString(),
      value: this.value.toString(),
      payload: this.payload?.toBoc().toString('hex'),
    };
  }

  static fromJSON(json: Record<string, unknown>) {
    return new CallbackPayload({
      receiver: json.receiver as string,
      value: json.value as string,
      payload: json.payload ? Cell.fromHex(json.payload as string) : undefined,
    });
  }
}
