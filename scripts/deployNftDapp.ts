import { Address, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import TonWeb from "tonweb";
import tonMnemonic from "tonweb-mnemonic";

const createKeyPair = async () => {
    const words = await tonMnemonic.generateMnemonic();
    const seed = await tonMnemonic.mnemonicToSeed(words);
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);

    return TonWeb.utils.bytesToHex(keyPair.publicKey);
}

const publicKey = createKeyPair();

export async function run(provider: NetworkProvider) {
    const nftDapp = NftDapp.createFromConfig(
        {
            seqno: 0,
            publicKey: publicKey,
            ownerAddress: new Address(0, ),
            nextCollectionIndex: 0,
            collectioinsDict: Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address()),
        }, 
        await compile('NftDapp')
    );

    await provider.deploy(nftDapp, toNano('0.05'));

    const openedContract = provider.open(nftDapp);

}
