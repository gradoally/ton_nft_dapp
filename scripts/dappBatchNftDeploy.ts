import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';
import { Opcodes } from '../wrappers/utils/opCodes';
import { sign } from 'ton-crypto';
import { createKeys } from './helpers/keys';
import { randomAddress } from './helpers/randomAddr';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    const keypair = await createKeys();

    const seqno = await nftDapp.getSeqno();

    await nftDapp.sendBatchNftDeployMsg({
        nfts: [
            {
                passAmount: toNano('0.5'),
                index: 0,
                ownerAddress: randomAddress(),
                content: '1'
            },
            {
                passAmount: toNano('0.5'),
                index: 1,
                ownerAddress: randomAddress(),
                content: '2'
            },
        ],
        signFunc: (buf) => sign(buf, keypair.secretKey),
        amount: toNano('0.02'),
        address: randomAddress(),
        opCode: Opcodes.batchNftDeploy,
        queryId: Date.now(),
        collectionId: 3,
        seqno: seqno,
    });

    ui.write("Successfully deployed batch of nfts!");
}
