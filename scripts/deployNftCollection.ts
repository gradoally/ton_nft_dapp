import { toNano } from 'ton-core';
import { NftCollection } from '../wrappers/NftCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const nftCollection = NftCollection.createFromConfig({}, await compile('NftCollection'));

    await provider.deploy(nftCollection, toNano('0.05'));

    const openedContract = provider.open(nftCollection);

    // run methods on `openedContract`
}
