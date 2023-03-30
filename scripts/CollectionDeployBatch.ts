import { NftDapp } from '../wrappers/NftDapp';
import { Opcodes } from '../wrappers/utils/opCodes';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { FreelancersCollection } from '../wrappers/FreelancersCollection';
import { randomAddress } from './helpers/randomAddr';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Collection address'));

    const nftCollection = provider.open(FreelancersCollection.createFromAddress(address));

    await nftCollection.sendDeployBatchMsg(provider.sender(), {
        value: toNano('0.02'),
        queryId: Date.now(),
        items: [
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
    });

    ui.write("Successfully deployed batch of nfts!");
}
