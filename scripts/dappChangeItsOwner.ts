import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';
import { randomAddress } from './helpers/randomAddr';
import { Opcodes } from '../wrappers/utils/opCodes';
import { createKeys } from './helpers/keys';
import { sign } from 'ton-crypto';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    const seqno = await nftDapp.getSeqno();

    const keypair = await createKeys();

    await nftDapp.sendChangeDappOwnerMsg({
        newOwner: randomAddress(),
        opCode: Opcodes.changeOwner,
        signFunc: (buf) => sign(buf, keypair.secretKey),
        seqno: seqno,
        value: toNano('0.05'),
    })

    ui.write('Owner changed successfully!');

}