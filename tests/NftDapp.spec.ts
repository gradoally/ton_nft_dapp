import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('NftDapp', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('NftDapp');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const nftDapp = blockchain.openContract(NftDapp.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await nftDapp.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftDapp.address,
            deploy: true,
        });
    });
});
