import { Address, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

        await nftDapp.sendDestroySbtMsg(provider.sender(), {
            queryId: Date.now(),
            itemAddress: Address.parse("EQCIdOdc6__fo1oqwBTaXLEg0RawVanTMe8ahLpZYm4RxffR")
        });

    ui.write('Destroyed successfully!');
}