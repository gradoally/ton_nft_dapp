import { NftDapp, Opcodes } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { sign } from 'ton-crypto';
import { createKeys } from './helpers/keys';
import { randomAddress } from './helpers/randomAddr';
import { randomSeed } from './helpers/randomSeed';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    const keypair = await createKeys();

    const seqno = await nftDapp.getSeqno();

    await nftDapp.sendDeployNftItemMsg({
            itemIndex: 1,
            itemContent: beginCell().storeUint(randomSeed, 256).endCell(),
            signFunc: (buf) => sign(buf, keypair.secretKey),
            amount: toNano('0.02'),
            address: randomAddress(),
            opCode: Opcodes.deployNftItem,
            queryId: Date.now(),
            collectionId: 3,
            seqno: seqno,
    });

    ui.write("Nft item successfully deployed!");
}

