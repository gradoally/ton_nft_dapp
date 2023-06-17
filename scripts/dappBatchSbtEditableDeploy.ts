import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    await nftDapp.sendBatchSbtDeployMsg(provider.sender(), {
        sbts: [
            {
                passAmount: toNano('0.05'),
                index: 0,
                ownerAddress: address,
                editorAddress: address,
                authorityAddress: address,
                content: '1'
            },
            {
                passAmount: toNano('0.05'),
                index: 1,
                ownerAddress: address,
                editorAddress: address,
                authorityAddress: address,
                content: '2'
            },
        ],
        queryId: Date.now(),
        collectionId: 0,
    });

    ui.write("Successfully deployed batch of editable sbts!");
}
