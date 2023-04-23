import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';
import { randomAddress } from './helpers/randomAddr';


export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    await nftDapp.sendDeployItemMsg(provider.sender(), {
            itemIndex: 0,
            itemOwnerAddress: Address.parse('EQARxWqNZakl_Ulh61RcYR4eHpm_0-t-FT2HNVsAGMSencjf'),
            itemAuthorityAddress: randomAddress(),
            itemEditorAddress: Address.parse('EQARxWqNZakl_Ulh61RcYR4eHpm_0-t-FT2HNVsAGMSencjf'),
            itemContent: '1234',
            value: toNano('0.2'),
            queryId: Date.now(),
            collectionId: 2,
    });

    ui.write("Item successfully deployed!");
}

