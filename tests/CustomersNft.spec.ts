import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { CustomersNft } from '../wrappers/CustomersNft';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('CustomersNft', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('CustomersNft');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const customersNft = blockchain.openContract(CustomersNft.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await customersNft.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: customersNft.address,
            deploy: true,
        });
    });
});
