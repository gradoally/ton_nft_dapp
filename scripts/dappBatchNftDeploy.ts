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

    await nftDapp.sendBatchNftDeployMsg(provider.sender(), {
        nfts: [
            {
                passAmount: toNano('0.05'),
                index: 0,
                ownerAddress: randomAddress(),
                content: '1'
            },
            {
                passAmount: toNano('0.05'),
                index: 1,
                ownerAddress: randomAddress(),
                content: '2'
            },
        ],
        value: toNano('0.1'),
        address: randomAddress(),
        queryId: 123,
        collectionId: 0,
    });

    ui.write("Successfully deployed batch of nfts!");
}
