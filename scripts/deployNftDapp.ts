import { Address, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { mnemonicNew, mnemonicToPrivateKey } from 'ton-crypto';

export async function createKeys() {
    let words = Array('country corn author swear flame volume sea item add age grain leaf post skin unveil garment vault thing cute few chat claw during thrive');
    // await mnemonicNew(24);
    const keys = mnemonicToPrivateKey(words);
    return keys;
}

export async function run(provider: NetworkProvider) {
    const nftDapp = NftDapp.createFromConfig(
        {
            seqno: 0,
            publicKey: (await createKeys()).publicKey,
            ownerAddress: Address.parse('EQBNHgU3GiNnGewebGogIfblJhInOtKkbO6knXDXQ24BBOJX'),
            nextCollectionIndex: 0,
            collectionsDict: Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address()),
        }, 
        await compile('NftDapp')
    );

    await provider.deploy(nftDapp, toNano('0.05'));

    const openedContract = provider.open(nftDapp);

}

