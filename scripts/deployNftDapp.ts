import { toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const nftDapp = NftDapp.createFromConfig({}, await compile('NftDapp'));

    await provider.deploy(nftDapp, toNano('0.05'));

    const openedContract = provider.open(nftDapp);

    // run methods on `openedContract`
}
