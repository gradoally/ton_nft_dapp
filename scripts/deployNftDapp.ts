import { Address, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { createKeys } from './helpers/keys';

export async function run(provider: NetworkProvider) {
    const nftDapp = NftDapp.createFromConfig(
        {
            publicKey: (await createKeys()).publicKey,
            ownerAddress: provider.sender().address as Address,
            nextCollectionIndex: 0,
            collectionsDict: Dictionary.empty(Dictionary.Keys.Uint(256), Dictionary.Values.Address()),
        },

        await compile('NftDapp')
    );

    await provider.deploy(nftDapp, toNano('1'));

}