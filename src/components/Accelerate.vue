<script setup lang="ts">
import Big from "big.js";
import { getInputsInfo, getOutputsInfo } from "~/apis/tx";
import { Buffer, bitcoin, parseBtc } from "~/assets/scripts/tx";
import { getAccounts, getPublicKey } from "~/assets/scripts/wallet";

const txHash = ref("");
const gasFee = ref(0);

async function onClickAccelerate() {
  if (!txHash.value || !gasFee.value) {
    alert("请输入txHash或gasFee");
    return;
  }

  const accounts = await getAccounts();
  const address = accounts[0];
  const { xOnlyPublicKey } = await getPublicKey();
  const { output } = bitcoin.payments.p2tr({
    internalPubkey: xOnlyPublicKey,
  });

  const inputs = await getInputsInfo(txHash.value);
  console.log(inputs);
  const outputs = await getOutputsInfo(txHash.value);
  console.log(outputs);
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });

  inputs.forEach((input) => {
    psbt.addInput({
      hash: input.utxid,
      index: input.vout,
      witnessUtxo: {
        script: Buffer.from(output!),
        value: input.satoshi,
      },
      tapInternalKey: xOnlyPublicKey,
      sequence: Big(input.sequence).minus(1).toNumber(), // 通过设置比之前的 sequence 更小的值来替换上一笔交易（gas必须更大）
    });
  });

  outputs.forEach((output) => {
    let value = output.satoshi;
    if (output.address === address) {
      value = parseBtc(gasFee.value);
    }
    psbt.addOutput({
      address: output.address,
      value,
    });
  });

  const psbtHex = psbt.toHex();
  const tx = await window.unisat.signPsbt(psbtHex);
  console.log(tx);
  //   await window.unisat.pushPsbt(tx);
}
</script>

<template>
  <div>
    <label for="" block>
      txHash:
      <input type="text" v-model="txHash" />
    </label>
    <label for="" block>
      gas:
      <input type="text" v-model="gasFee" />
    </label>
    <button @click="onClickAccelerate">加速交易</button>
  </div>
</template>
