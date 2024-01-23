import { toXOnly } from "./tx";

let accounts = [] as string[];
export async function getAccounts(): Promise<string[]> {
  if (accounts.length) return accounts;
  return (accounts = await window.unisat.requestAccounts());
}

let publicKey = "";
export async function getPublicKey() {
  if (!publicKey) {
    publicKey = await window.unisat.getPublicKey();
  }
  const publicKeyHex = Buffer.from(publicKey, "hex");
  const xOnlyPublicKey = toXOnly(publicKeyHex);
  return {
    publicKey,
    publicKeyHex,
    xOnlyPublicKey,
  };
}
