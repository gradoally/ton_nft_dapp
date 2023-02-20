import { toNano } from 'ton-core';
import { AdminCollection } from '../wrappers/AdminCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const adminCollection = AdminCollection.createFromConfig({}, await compile('AdminCollection'));

    await provider.deploy(adminCollection, toNano('0.05'));

    const openedContract = provider.open(adminCollection);

    // run methods on `openedContract`
}
