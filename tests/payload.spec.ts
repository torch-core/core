import { Address, beginCell, toNano } from '@ton/core';
import { CallbackPayload } from '../src';

describe('Payload', () => {
  it('Should create a payload ', () => {
    const payload = new CallbackPayload({
      receiver: 'EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav',
      value: '1000000000',
      payload: beginCell().endCell(),
    });

    const expectedAddress = Address.parse('EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav').toString();
    const expectedValue = toNano('1');
    const expectePayload = beginCell().endCell();

    expect(payload).toBeDefined();
    expect(payload.receiver.toString()).toEqual(expectedAddress);
    expect(payload.value).toEqual(expectedValue);
    expect(payload.payload?.toString()).toEqual(expectePayload.toString());
  });

  it('Should convert Callback payload between JSON', () => {
    const payload = new CallbackPayload({
      receiver: 'EQC98_qAmNEptUtPc7W6xdHh_ZHrBUFpw5Ft_IzNU20QAJav',
      value: toNano('1'),
      payload: beginCell().endCell(),
    });

    const json = payload.toJSON();
    const transformed = CallbackPayload.fromJSON(json);
    console.log(transformed.toJSON());
    expect(transformed.receiver.toString()).toEqual(payload.receiver.toString());
    expect(transformed.value).toEqual(payload.value);
    expect(transformed.payload?.toString()).toEqual(payload.payload?.toString());
  });
});
