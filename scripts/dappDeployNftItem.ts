import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';
import { randomAddress } from './helpers/randomAddr';


export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    await nftDapp.sendDeployNftItemMsg(provider.sender(), {
            itemIndex: 0,
            itemOwnerAddress: Address.parse('EQBicYiXoL5MWQj_3cToMc35GOq6iOOT4txcHLznvGwQU0aC'),
            itemContent: 'asdasdasd',
            value: toNano('0.2'),
            queryId: Date.now(),
            address: randomAddress(),
            collectionId: 1,
    });

    ui.write("Nft item successfully deployed!");
}

