import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { AdminCollection } from '../wrappers/AdminCollection';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('AdminCollection', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('AdminCollection');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const adminCollection = blockchain.openContract(AdminCollection.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await adminCollection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: adminCollection.address,
            deploy: true,
        });
    });
});
