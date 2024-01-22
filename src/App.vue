<script setup lang="ts">
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { Buffer } from "node:buffer";
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import Big from "big.js";

const txHash =
  "c4e20639cadaf20c47747f3673248f5efbcdd23ac2b82089e8d1acb91278592f";
const txIndex = 9;

const fromAmount = 0.00001;
const toAmount = 0.000001;
// const vbPerSats = 1;
const feeAmount = 0.00000142;
const toAddress = "tb1q5tsjcyz7xmet07yxtumakt739y53hcttmntajq";

bitcoin.initEccLib(ecc);

// from unisat
const unisatBearerToken =
  "6965b4e30e0ee1129de9ce5680d5148a98f17da4f651bc8442b6c6acb9970b9d";

const mainetTxId =
  "7ebe98abd6d6b8f8ca87a29720659c9fba63dccf8c63567cdebfc5c8ba47f39b";
async function getTxInfo(txid: string) {
  /**
   * {
      code: 0,
      msg: "ok",
      data: {
        txid: "7ebe98abd6d6b8f8ca87a29720659c9fba63dccf8c63567cdebfc5c8ba47f39b",
        nIn: 1,
        nOut: 2,
        size: 222,
        witOffset: 0,
        locktime: 0,
        inSatoshi: 10900000,
        outSatoshi: 10890694,
        nNewInscription: 0,
        nInInscription: 0,
        nOutInscription: 0,
        nLostInscription: 0,
        timestamp: 0,
        height: 4194303,
        blkid: "0000000000000000000000000000000000000000000000000000000000000000",
        idx: 43089,
        confirmations: 0,
      },
    };
   */
  return await fetch(`https://open-api.unisat.io/v1/indexer/tx/${txid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${unisatBearerToken}`,
    },
  });
}

async function getInputsInfo(txid: string) {
  /**
   * {
      code: 0,
      msg: "ok",
      data: [
        {
          height: 4194303,
          txid: "7ebe98abd6d6b8f8ca87a29720659c9fba63dccf8c63567cdebfc5c8ba47f39b",
          idx: 0,
          scriptSig: "",
          scriptWits:
            "024730440220419cd181f677ee7fe4be7d7f47a7acf1013ecf2a943ec6305d62b93fba7c5200022046cc904afe79767fb55d8dc32bc02d3e95a708e85e4dc273773c017def0b4ce1012102bad627e98b27cb03b79fe316cce17e89c7c51bf36636c932a4df05fc98675182",
          sequence: 4294967295, @sequence 0xffffffff === 4294967295 {该交易不可加速}
          heightTxo: 826462,
          utxid:
            "c4cf1bf7564fe363f8227ebd37ec050e786039a79a8f3b55c7893b2963adf631", // @hash
          vout: 0, // @index
          address: "bc1q4l0twnsrjgpvqq8hxg76d3v8r73vwyfye2hrpa",
          codeType: 7,
          satoshi: 10900000, // @fromAmount
          scriptType: "0014",
          scriptPk: "0014afdeb74e039202c000f7323da6c5871fa2c71124",
          inscriptions: [],
        },
      ],
    };
   */
  return await fetch(`https://open-api.unisat.io/v1/indexer/tx/${txid}/ins`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${unisatBearerToken}`,
    },
  });
}

async function getOutputsInfo(txid: string) {
  /**
   * {
      code: 0,
      msg: "ok",
      data: [
        {
          txid: "7ebe98abd6d6b8f8ca87a29720659c9fba63dccf8c63567cdebfc5c8ba47f39b",
          vout: 0,
          address: "bc1q8jyyutlsdl75hw67n08ntg636y5j2k64smajcg", // @address
          codeType: 0,
          satoshi: 7210667, // @value
          scriptType: "0014",
          scriptPk: "00143c884e2ff06ffd4bbb5e9bcf35a351d129255b55",
          height: 4194303,
          idx: 43089,
          inscriptions: [],
          txidSpent:
            "0000000000000000000000000000000000000000000000000000000000000000",
          heightSpent: 0,
        },
        {
          txid: "7ebe98abd6d6b8f8ca87a29720659c9fba63dccf8c63567cdebfc5c8ba47f39b",
          vout: 1,
          address: "bc1q4l0twnsrjgpvqq8hxg76d3v8r73vwyfye2hrpa",
          codeType: 0,
          satoshi: 3680027,
          scriptType: "0014",
          scriptPk: "0014afdeb74e039202c000f7323da6c5871fa2c71124",
          height: 4194303,
          idx: 43089,
          inscriptions: [],
          txidSpent:
            "0000000000000000000000000000000000000000000000000000000000000000",
          heightSpent: 0,
        },
      ],
    };
   */
  return await fetch(`https://open-api.unisat.io/v1/indexer/tx/${txid}/outs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${unisatBearerToken}`,
    },
  });
}

async function onClickGetTxInfo() {
  const info = await getTxInfo(mainetTxId);
  const result = await info.json();
  console.log("txInfo", result);

  const input = await getInputsInfo(mainetTxId);
  const result2 = await input.json();
  console.log("input", result2);

  const output = await getOutputsInfo(mainetTxId);
  const result3 = await output.json();
  console.log("output", result3);
}

async function onClickSign() {
  const accounts = await window.unisat.requestAccounts();
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
    sequence: 0xfffffffd, // 如果 sequence < 0xffffffff 就表示可以加速
  });
  psbt.addOutput({
    address: toAddress,
    value: parseBtc(toAmount),
  });
  psbt.addOutput({
    address: accounts[0],
    // value: Big(parseBtc(Big(fromAmount).minus(toAmount).toNumber()))
    //   .minus(computeTxFee(1, 2, vbPerSats))
    //   .toNumber(),
    value: parseBtc(
      Big(fromAmount).minus(toAmount).minus(feeAmount).toNumber()
    ),
  });
  const psbtHex = psbt.toHex();
  console.log(psbtHex);
  const tx = await window.unisat.signPsbt(psbt.toHex());
  await window.unisat.pushPsbt(tx);
}

async function onClickAccelerate() {
  const accounts = await window.unisat.requestAccounts();
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
    sequence: 0xfffffffb, // 通过设置比之前的 sequence 更小的值来替换上一笔交易（gas必须更大）
  });
  psbt.addOutput({
    address: accounts[0],
    value: parseBtc(Big(fromAmount).minus(feeAmount).toNumber()),
  });
  const psbtHex = psbt.toHex();
  console.log(psbtHex);
  const tx = await window.unisat.signPsbt(psbt.toHex());
  await window.unisat.pushPsbt(tx);
}

function parseBtc(num: number) {
  return Big(num).times(1e8).toNumber();
}

// 计算 gas
// TODO ========
// @refresh https://bitcoinops.org/en/tools/calc-size/
// function computeVbSize(inputLength: number, outPutLength: number) {
//   const overhead = 10;
//   const inputs = Big(inputLength).times(148).toNumber();
//   const outputs = Big(outPutLength).times(34).toNumber();
//   return Big(overhead).plus(inputs).plus(outputs).toNumber();
// }

// function computeTxFee(
//   inputLength: number,
//   outPutLength: number,
//   vbPerSats: number
// ) {
//   return Big(vbPerSats)
//     .times(computeVbSize(inputLength, outPutLength))
//     .toNumber();
// }
</script>

<template>
  <div>
    <button @click="onClickSign">发送一笔交易</button>
    <button @click="onClickAccelerate">加速上一笔交易</button>
    <button @click="onClickGetTxInfo">获取交易信息</button>
  </div>
</template>
