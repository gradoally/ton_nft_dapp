import { Address, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

        await nftDapp.sendDestroySbtMsg(provider.sender(), {
            value: toNano('0.1'),
            queryId: Date.now(),
            itemAddress: Address.parse("EQCCl-4HH_JL_mqhnaIH3SGQtGvDMkMK1liUyDfWX11VWuN7")
        });

    ui.write('Destroyed successfully!');
}