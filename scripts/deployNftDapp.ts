import { Address, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { mnemonicNew, mnemonicToPrivateKey } from 'ton-crypto';
import { Buffer } from 'buffer';

export async function createKeys() {
    let words = await mnemonicNew(24);
    const keys = mnemonicToPrivateKey(words);
    return keys;
}

export async function run(provider: NetworkProvider) {
    const nftDapp = NftDapp.createFromConfig(
        {
            seqno: 0,
            publicKey: (await createKeys()).publicKey,
            ownerAddress: new Address(0, Buffer.from('80d78a35f955a14b679faa887ff4cd5bfc0f43b4a4eea2a7e6927f3701b273c2')),
            nextCollectionIndex: 0,
            collectionsDict: Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address()),
        }, 
        await compile('NftDapp')
    );

    await provider.deploy(nftDapp, toNano('0.05'));

    const openedContract = provider.open(nftDapp);

}

