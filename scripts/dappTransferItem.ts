import { Address, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

        await nftDapp.sendTransferItemMsg(provider.sender(), {
            fwdAmount: toNano('10'),
            queryId: Date.now(),
            newOwner: Address.parse("EQCYWqCLhjA84KC3zangbf9ZH-htR1GqcNmS0MF-6UAnLUyo"),
            responseAddress: provider.sender().address as Address,
            itemAddress: Address.parse("EQAzymydRqJq5JtTr11iX1R9IflsDIrvITORAmAXdP6oTLp5")
        });

    ui.write('Transfered successfully!');
}