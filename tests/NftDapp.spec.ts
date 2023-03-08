import { Blockchain } from '@ton-community/sandbox';
import { Address, Cell, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { createKeys } from '../scripts/deployNftDapp';

describe('NftDapp', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('NftDapp');
    });

    it('should deploy', async () => {
        const blockchain = await Blockchain.create();

        const nftDapp = blockchain.openContract(NftDapp.createFromConfig(
            {
                seqno: 0,
                publicKey: (await createKeys()).publicKey,
                ownerAddress: new Address(0, Buffer.from('80d78a35f955a14b679faa887ff4cd5bfc0f43b4a4eea2a7e6927f3701b273c2')),
                nextCollectionIndex: 0,
                collectionsDict: Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address()),
            }, 
            code
        ));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await nftDapp.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftDapp.address,
            deploy: true,
        });
    });
});
