import { NftDapp } from '../../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';
import { randomAddress } from '../helpers/randomAddr';
import { sleep } from '@ton-community/blueprint/dist/utils';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

   // const ownerBefore = await nftDapp.getDappOwner();

    await nftDapp.sendChangeDappOwnerMsg(provider.sender(), {
        newOwner: randomAddress(),
        value: toNano('0.05'),
    })

    ui.write("Waiting for Dapp to change it's owner...");

    // let ownerAfter = await nftDapp.getDappOwner();
    // let attempt = 1;
    // while (ownerAfter === ownerBefore) {
    //     ui.setActionPrompt(`Attempt ${attempt}`);
    //     await sleep(2000);
    //     ownerAfter = await nftDapp.getDappOwner();
    //     attempt++;
    // }

    // ui.clearActionPrompt();
    ui.write('Owner changed successfully!');

}