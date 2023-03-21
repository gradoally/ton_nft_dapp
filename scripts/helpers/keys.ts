import { mnemonicToPrivateKey } from "ton-crypto";

export async function createKeys() {
  let words = Array('country corn author swear flame volume sea item add age grain leaf post skin unveil garment vault thing cute few chat claw during thrive'); 

  const keys = mnemonicToPrivateKey(words);
  return keys;
}