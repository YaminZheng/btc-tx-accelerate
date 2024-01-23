<script setup lang="ts">
import Big from "big.js";
import { bitcoin, Buffer, parseBtc } from "~/assets/scripts/tx";
import { getAccounts, getPublicKey } from "~/assets/scripts/wallet";

const txHash =
  "6aa3a1bc3ac03e88d674da8705e9edad66f545c90d5a179b93e22465ec397d33";
const txIndex = 0;

const fromAmount = 0.00118663;
const toAmount = 0.000001;
const feeAmount = 0.00000142;
const toAddress = "tb1pp7clwhg7dvzuykrc23n8fnetzmt20lv2zvd0yynr63phhzrcwwdqrsv8ex";

async function onClickSend() {
  const accounts = await getAccounts();
  const { xOnlyPublicKey } = await getPublicKey();
  const { output } = bitcoin.payments.p2tr({
    internalPubkey: xOnlyPublicKey,
  });
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
  psbt.addInput({
    hash: txHash,
    index: txIndex,
    witnessUtxo: { script: Buffer.from(output!), value: parseBtc(fromAmount) },
    tapInternalKey: xOnlyPublicKey,
    sequence: 0xfffffffd, // 如果 sequence < 0xffffffff 就表示可以加速
  });
  psbt.addOutput({
    address: toAddress,
    value: parseBtc(toAmount),
  });
  psbt.addOutput({
    address: accounts[0],
    value: parseBtc(
      Big(fromAmount).minus(toAmount).minus(feeAmount).toNumber()
    ),
  });
  const psbtHex = psbt.toHex();
  const tx = await window.unisat.signPsbt(psbtHex);
  console.log(tx);
  //   await window.unisat.pushPsbt(tx);
}
</script>

<template>
  <div>
    <button @click="onClickSend">发送交易</button>
  </div>
</template>
