import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { CustomersCollection } from '../wrappers/CustomersCollection';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('CustomersCollection', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('CustomersCollection');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const customersCollection = blockchain.openContract(CustomersCollection.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await customersCollection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: customersCollection.address,
            deploy: true,
        });
    });
});
