import { Address, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { createKeys } from './helpers/keys';

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

}

