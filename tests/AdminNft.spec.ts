import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { AdminNft } from '../wrappers/AdminNft';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('AdminNft', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('AdminNft');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const adminNft = blockchain.openContract(AdminNft.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await adminNft.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: adminNft.address,
            deploy: true,
        });
    });
});
