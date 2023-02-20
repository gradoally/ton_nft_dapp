import { Blockchain } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { NftCollection } from '../wrappers/NftCollection';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('NftCollection', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('NftCollection');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const nftCollection = blockchain.openContract(NftCollection.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await nftCollection.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftCollection.address,
            deploy: true,
        });
    });
});
