import { toNano } from 'ton-core';
import { CustomersCollection } from '../wrappers/CustomersCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const customersCollection = CustomersCollection.createFromConfig({}, await compile('CustomersCollection'));

    await provider.deploy(customersCollection, toNano('0.05'));

    const openedContract = provider.open(customersCollection);

    // run methods on `openedContract`
}
