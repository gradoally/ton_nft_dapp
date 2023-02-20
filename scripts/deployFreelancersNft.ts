import { toNano } from 'ton-core';
import { FreelancersNft } from '../wrappers/FreelancersNft';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const freelancersNft = FreelancersNft.createFromConfig({}, await compile('FreelancersNft'));

    await provider.deploy(freelancersNft, toNano('0.05'));

    const openedContract = provider.open(freelancersNft);

    // run methods on `openedContract`
}
