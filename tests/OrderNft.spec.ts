import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { OrderNft } from '../wrappers/OrderNft';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('OrderNft', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('OrderNft');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const orderNft = blockchain.openContract(OrderNft.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await orderNft.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: orderNft.address,
            deploy: true,
        });
    });
});
