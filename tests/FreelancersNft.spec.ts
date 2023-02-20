import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { FreelancersNft } from '../wrappers/FreelancersNft';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('FreelancersNft', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('FreelancersNft');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const freelancersNft = blockchain.openContract(FreelancersNft.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await freelancersNft.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: freelancersNft.address,
            deploy: true,
        });
    });
});
