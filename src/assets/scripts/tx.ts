import Big from "big.js";
import * as bitcoin from "bitcoinjs-lib";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import { Buffer } from "node:buffer";

export { toXOnly, bitcoin, Buffer };

export function parseBtc(num: number) {
  return Big(num).times(1e8).toNumber();
}

export function computeTxFee(
  inputLength: number,
  outPutLength: number,
  vbPerSats: number
) {
  /**
   * TODO
   *
   * @description Compute Gas Fee
   * @Refrensh https://bitcoinops.org/en/tools/calc-size/
   */
  return Big(vbPerSats)
    .times(computeVbSize(inputLength, outPutLength))
    .toNumber();
}

export function computeVbSize(inputLength: number, outPutLength: number) {
  const overhead = 10;
  const inputs = Big(inputLength).times(148).toNumber();
  const outputs = Big(outPutLength).times(34).toNumber();
  return Big(overhead).plus(inputs).plus(outputs).toNumber();
}
