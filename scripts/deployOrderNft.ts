import { toNano } from 'ton-core';
import { OrderNft } from '../wrappers/OrderNft';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const orderNft = OrderNft.createFromConfig({}, await compile('OrderNft'));

    await provider.deploy(orderNft, toNano('0.05'));

    const openedContract = provider.open(orderNft);

    // run methods on `openedContract`
}
