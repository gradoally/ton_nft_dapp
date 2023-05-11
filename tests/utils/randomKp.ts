import { KeyPair, mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";

export async function randomKp(): Promise<KeyPair> {
    let words = await mnemonicNew();
    return mnemonicToPrivateKey(words);
}