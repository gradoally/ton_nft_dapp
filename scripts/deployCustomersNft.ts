import { toNano } from 'ton-core';
import { CustomersNft } from '../wrappers/CustomersNft';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const customersNft = CustomersNft.createFromConfig({}, await compile('CustomersNft'));

    await provider.deploy(customersNft, toNano('0.05'));

    const openedContract = provider.open(customersNft);

    // run methods on `openedContract`
}
