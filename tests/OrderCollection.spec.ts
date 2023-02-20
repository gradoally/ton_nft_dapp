import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { OrderCollection } from '../wrappers/OrderCollection';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('OrderCollection', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('OrderCollection');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const orderCollection = blockchain.openContract(OrderCollection.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await orderCollection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: orderCollection.address,
            deploy: true,
        });
    });
});
