import { Address, beginCell, toNano } from 'ton-core';
import { AdminCollection } from '../wrappers/AdminCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { NftItemCodeCell } from './helpers/nftItemCode';
import { randomAddress } from './helpers/randomAddr';
import { randomSeed } from './helpers/randomSeed';

export async function run(provider: NetworkProvider) {

    const adminCollection = AdminCollection.createFromConfig(
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
    await compile('AdminCollection')
    );

    await provider.deploy(adminCollection, toNano('0.05'));

    const openedContract = provider.open(adminCollection);

}


