import { beginCell, toNano } from 'ton-core';
import { FreelancersCollection } from '../wrappers/FreelancersCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { randomAddress } from './helpers/randomAddr';
import { randomSeed } from './helpers/randomSeed';
import { NftItemCodeCell } from './helpers/nftItemCode';

export async function run(provider: NetworkProvider) {
    const freelancersCollection = FreelancersCollection.createFromConfig(
        {
            ownerAddress: randomAddress(),
            nextItemIndex: 0,
            content: beginCell().storeUint(randomSeed, 256).endCell(),
            nftItemCode: NftItemCodeCell,
            royaltyParams: beginCell()
                            .storeUint(12, 16)
                            .storeUint(100, 16) // 1,2 %
                            .storeAddress(randomAddress())
                            .endCell()
        }, 
        await compile('FreelancersCollection')
    );

    await provider.deploy(freelancersCollection, toNano('0.05'));

    const openedContract = provider.open(freelancersCollection);

    // run methods on `openedContract`
}
