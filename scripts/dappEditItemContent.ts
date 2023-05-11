import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    await nftDapp.sendEditItemContentMsg(provider.sender(), {
        newContent: '',
        itemAddress: Address.parse("EQAccX36sUCKkTK4UYPrgRgwEZjhdhAqhREVnOuPJ7fwNGPv"),
        value: toNano('0.2'),
        queryId: Date.now()
         
    });

    ui.write("Item content succesfully edited!");
}

