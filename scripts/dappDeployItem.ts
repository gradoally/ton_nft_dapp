import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address } from 'ton-core';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    await nftDapp.sendDeployItemMsg(provider.sender(), {
            itemIndex: 1,
            itemOwnerAddress: address,
            itemAuthorityAddress: address,
            itemEditorAddress: address,
            queryId: Date.now(),
            collectionId: 10,
    });

    ui.write("Item successfully deployed!");
}

