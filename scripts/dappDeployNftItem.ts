import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';


export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    await nftDapp.sendDeployNftItemMsg(provider.sender(), {
            itemIndex: 0,
            itemOwnerAddress: Address.parse('EQBdEoP1464NbHwyTDJO9Re7ZVPIqjwYpriewryjOideLXm6'),
            itemContent: '',
            value: toNano('0.2'),
            queryId: 123,
            collectionId: 0,
    });

    ui.write("Nft item successfully deployed!");
}

