import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';
import { sleep } from '@ton-community/blueprint/dist/utils';
import { createKeys } from './helpers/keys';
import { Opcodes } from '../wrappers/utils/opCodes';
import { sign } from 'ton-crypto';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    const balanceBefore = await nftDapp.getStateBalance();

    const seqno = await nftDapp.getSeqno();

    const keypair = await createKeys();

    await nftDapp.sendWithdrawMsg({
        seqno: seqno,
        signFunc: (buf) => sign(buf, keypair.secretKey),
        opCode: Opcodes.withdrawFunds,
        amount: toNano('0.5'),
        value: toNano('0.05'),
    })

    let balanceAfter = await nftDapp.getStateBalance();
    let attempt = 1;
    while (balanceBefore === balanceAfter) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        balanceAfter = await nftDapp.getStateBalance();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Success!');

}