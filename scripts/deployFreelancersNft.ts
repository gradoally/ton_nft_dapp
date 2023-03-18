import { Address, beginCell, toNano } from 'ton-core';
import { FreelancersNft } from '../wrappers/FreelancersNft';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { randomAddress } from './helpers/randomAddr';
import { randomSeed } from './helpers/randomSeed';

export async function run(provider: NetworkProvider) {
    const freelancersNft = FreelancersNft.createFromConfig(
        {
            index: 0,
            collectionAddress: randomAddress(),
            ownerAddress: randomAddress(),
            content: beginCell().storeUint(randomSeed, 256).endCell(),
            authorityAddress: randomAddress(),
            editorAddress: Address.parse("EQBEMxgQUG00VwOAvmPYfZbOQwllVU5zEIahLLKmtej43K3Y"),
            revokedAt: Math.floor(Date.now() / 1000)
        }, 
        await compile('FreelancersNft')
    );

    await provider.deploy(freelancersNft, toNano('0.05'));

}
