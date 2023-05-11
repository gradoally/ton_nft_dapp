import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { randomAddress } from './helpers/randomAddr';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    await nftDapp.sendEditCollectionContentMsg(provider.sender(), {
        collectionContent: '',
        commonContent: '',
        value: toNano('0.02'),
        queryId: Date.now(),
        collectionId: 2,
        royaltyParams: {
            royaltyFactor: 13,
            royaltyBase: 100,
            royaltyAddress: randomAddress()
        }
    });

    ui.write("Successfully changed collection content!");
}
