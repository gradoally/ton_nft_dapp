import { mnemonicToPrivateKey } from "ton-crypto";

export async function createKeys() {
  let words = Array('your mnemonic'); 

  const keys = mnemonicToPrivateKey(words);
  return keys;
}