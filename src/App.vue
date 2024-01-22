<script setup lang="ts">
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { Buffer } from "node:buffer";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import Big from "big.js";
import BIP32Factory from "bip32";

const fromAmount = 0.00001;
const toAmount = 0.000005;
const vbPerSats = 1;
const toAddress = "tb1q5tsjcyz7xmet07yxtumakt739y53hcttmntajq";
const txHash =
  "07404909d82a21d18278aa6cf92c5c5726ad95d6ac82e5f44bd24e6c23a7eaa8";
const txIndex = 0;

bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);

async function onClickSign() {
  const accounts = await window.unisat.requestAccounts();
  console.log(accounts);
  const publicKey = await window.unisat.getPublicKey();
  const publicKeyHex = Buffer.from(publicKey, "hex");
  const xOnlyPublicKey = toXOnly(publicKeyHex);
  const { output } = bitcoin.payments.p2tr({
    internalPubkey: xOnlyPublicKey,
  });
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
  psbt.addInput({
    hash: txHash,
    index: txIndex,
    witnessUtxo: { script: Buffer.from(output!), value: parseBtc(fromAmount) },
    tapInternalKey: xOnlyPublicKey,
  });
  psbt.addOutput({
    address: toAddress,
    value: parseBtc(toAmount),
  });
  psbt.addOutput({
    address: accounts[0],
    value:
      parseBtc(Big(fromAmount).minus(toAmount).toNumber()) -
      computeTxFee(1, 2, vbPerSats),
  });
  const psbtHex = psbt.toHex();
  console.log(psbtHex);
  const tx = await window.unisat.signPsbt(psbt.toHex());
  console.log(tx);

  // const response = await window.unisat.pushPsbt(tx);
  // console.log(response);
}

function parseBtc(num: number) {
  return Big(num).times(1e8).toNumber();
}

function computeVbSize(inputLength: number, outPutLength: number) {
  const overhead = 10;
  const inputs = Big(inputLength).times(148).toNumber();
  const outputs = Big(outPutLength).times(34).toNumber();
  return Big(overhead).plus(inputs).plus(outputs).toNumber();
}

function computeTxFee(
  inputLength: number,
  outPutLength: number,
  vbPerSats: number
) {
  return Big(vbPerSats)
    .times(computeVbSize(inputLength, outPutLength))
    .toNumber();
}
</script>

<template>
  <div>
    <button @click="onClickSign">发送一笔交易</button>
  </div>
</template>
