import { Address, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import TonWeb from "tonweb";
import { KeyPair, mnemonicNew, mnemonicToSeed } from 'ton-crypto';
import { Buffer } from 'buffer';
import nacl from 'tweetnacl';

// const createKeyPair = async () => {
    
//     let mnemonics = await mnemonicNew();
//     let keyPair = await mnemonicToPrivateKey(mnemonics);

//     return TonWeb.utils.bytesToHex(keyPair.publicKey);
// }

function normalizeMnemonic(src: string[]) {
    return src.map((v) => v.toLowerCase().trim());
}

async function mnemonicToPrivateKey(mnemonicArray: string[], password?: string | null | undefined): Promise<KeyPair> {

    mnemonicArray = normalizeMnemonic(mnemonicArray);
    const seed = (await mnemonicToSeed(mnemonicArray, 'TON default seed', password));
    let keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
    return {
        publicKey: Buffer.from(keyPair.publicKey),
        secretKey: Buffer.from(keyPair.secretKey)
    };
}

async function main () {
    let words = await mnemonicNew(24);
    const keys = mnemonicToPrivateKey(words);
    return keys;
}

export async function run(provider: NetworkProvider) {
    const nftDapp = NftDapp.createFromConfig(
        {
            seqno: 0,
            publicKey: (await main()).publicKey,
            ownerAddress: new Address(0, Buffer.from('80d78a35f955a14b679faa887ff4cd5bfc0f43b4a4eea2a7e6927f3701b273c2')),
            nextCollectionIndex: 0,
            collectioinsDict: Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address()),
        }, 
        await compile('NftDapp')
    );

    await provider.deploy(nftDapp, toNano('0.05'));

    const openedContract = provider.open(nftDapp);

}

