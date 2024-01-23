import request from "./request";
import { UNISAT_BEARER_TOKEN, UNISAT_BASE_URL, IS_TEST } from "~/config";

const baseUrl = IS_TEST ? UNISAT_BASE_URL.test : UNISAT_BASE_URL.mainnet;

const headers = {
  accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${UNISAT_BEARER_TOKEN}`,
};

export async function getTxInfo(txid: string): Promise<{
  txid: string;
  nIn: number;
  nOut: number;
  size: number;
  witOffset: number;
  locktime: number;
  inSatoshi: number;
  outSatoshi: number;
  nNewInscription: number;
  nInInscription: number;
  nOutInscription: number;
  nLostInscription: number;
  timestamp: number;
  height: number;
  blkid: string;
  idx: number;
  confirmations: number;
}> {
  return await request.get(`${baseUrl}/v1/indexer/tx/${txid}`, {
    headers,
  });
}

export async function getInputsInfo(txid: string): Promise<
  Array<{
    height: number;
    txid: string;
    idx: number;
    scriptSig: string;
    scriptWits: string;
    sequence: number; // @sequence 0xffffffff === 4294967295 {该交易不可加速}
    heightTxo: number;
    utxid: string; // @hash
    vout: number; // @index
    address: string;
    codeType: number;
    satoshi: number; // @fromAmount
    scriptType: string;
    scriptPk: string;
    inscriptions: string[];
  }>
> {
  return await request.get(`${baseUrl}/v1/indexer/tx/${txid}/ins?cursor=0&size=16`, {
    headers,
  });
}

export async function getOutputsInfo(txid: string): Promise<
  Array<{
    txid: string;
    vout: number;
    address: string; // @address
    codeType: number;
    satoshi: number; // @value
    scriptType: string;
    scriptPk: string;
    height: number;
    idx: number;
    inscriptions: string[];
    txidSpent: string;
    heightSpent: number;
  }>
> {
  return await request.get(`${baseUrl}/v1/indexer/tx/${txid}/outs`, {
    headers,
  });
}
