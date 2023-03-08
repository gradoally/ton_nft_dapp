import { beginCell, toNano } from 'ton-core';
import { AdminNft } from '../wrappers/AdminNft';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { randomAddress } from './helpers/randomAddr';
import { randomSeed } from './helpers/randomSeed';

export async function run(provider: NetworkProvider) {
    const adminNft = AdminNft.createFromConfig(
        {
            index: 0,
            collectionAddress: randomAddress(),
            ownerAddress: randomAddress(),
            content: beginCell().storeUint(randomSeed, 256).endCell(),
            authorityAddress: randomAddress(),
            editorAddress: randomAddress(),
            revokedAt: Math.floor(Date.now() / 1000)

        }, 
        await compile('AdminNft')
    );

    await provider.deploy(adminNft, toNano('0.05'));

    const openedContract = provider.open(adminNft);

    // run methods on `openedContract`
}
