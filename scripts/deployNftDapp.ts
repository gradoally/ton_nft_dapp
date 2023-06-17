import { Address, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const nftDapp = NftDapp.createFromConfig(
        {
            ownerAddress: provider.sender().address as Address,
            nextCollectionIndex: 0,
            collectionsDict: Dictionary.empty(Dictionary.Keys.Uint(256), Dictionary.Values.Address()),
        },

        await compile('NftDapp')
    );

    await provider.deploy(nftDapp, toNano('1'));

}