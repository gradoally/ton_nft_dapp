import { toNano } from 'ton-core';
import { AdminNft } from '../wrappers/AdminNft';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const adminNft = AdminNft.createFromConfig({}, await compile('AdminNft'));

    await provider.deploy(adminNft, toNano('0.05'));

    const openedContract = provider.open(adminNft);

    // run methods on `openedContract`
}
