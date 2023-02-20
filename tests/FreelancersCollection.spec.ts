import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { FreelancersCollection } from '../wrappers/FreelancersCollection';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('FreelancersCollection', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('FreelancersCollection');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const freelancersCollection = blockchain.openContract(FreelancersCollection.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await freelancersCollection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: freelancersCollection.address,
            deploy: true,
        });
    });
});
