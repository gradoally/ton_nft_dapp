import { toNano } from 'ton-core';
import { OrderCollection } from '../wrappers/OrderCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const orderCollection = OrderCollection.createFromConfig({}, await compile('OrderCollection'));

    await provider.deploy(orderCollection, toNano('0.05'));

    const openedContract = provider.open(orderCollection);

    // run methods on `openedContract`
}
