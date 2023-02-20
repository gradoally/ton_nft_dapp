import { toNano } from 'ton-core';
import { FreelancersCollection } from '../wrappers/FreelancersCollection';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const freelancersCollection = FreelancersCollection.createFromConfig({}, await compile('FreelancersCollection'));

    await provider.deploy(freelancersCollection, toNano('0.05'));

    const openedContract = provider.open(freelancersCollection);

    // run methods on `openedContract`
}
