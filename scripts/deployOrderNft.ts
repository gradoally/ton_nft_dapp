import { Address, Dictionary, toNano } from 'ton-core';
import { OrderNft } from '../wrappers/OrderNft';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { randomAddress } from './helpers/randomAddr';

export async function run(provider: NetworkProvider) {
    const orderNft = OrderNft.createFromConfig(
        {
            index: 0,
            collectionAddress: randomAddress(),
            ownerAddress: randomAddress(),
            content: Dictionary.empty(Dictionary.Keys.Uint(256), Dictionary.Values.Cell()),
            authorityAddress: randomAddress(),
            editorAddress: Address.parse("EQBEMxgQUG00VwOAvmPYfZbOQwllVU5zEIahLLKmtej43K3Y"),
            revokedAt: Math.floor(Date.now() / 1000)
        }, 
        await compile('OrderNft')
    );

    await provider.deploy(orderNft, toNano('0.05'));
    
}
