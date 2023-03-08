import { beginCell, toNano } from 'ton-core';
import { CustomersNft } from '../wrappers/CustomersNft';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { randomAddress } from './helpers/randomAddr';
import { randomSeed } from './helpers/randomSeed';

export async function run(provider: NetworkProvider) {
    const customersNft = CustomersNft.createFromConfig(
        {
            index: 0,
            collectionAddress: randomAddress(),
            ownerAddress: randomAddress(),
            content: beginCell().storeUint(randomSeed, 256).endCell(),
            editorAddress: randomAddress()
        }, 
        await compile('CustomersNft')
    );

    await provider.deploy(customersNft, toNano('0.05'));

    const openedContract = provider.open(customersNft);

    // run methods on `openedContract`
}
