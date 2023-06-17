import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { buildNftCollectionDataCell } from '../wrappers/utils/collectionHelpers';
import { randomAddress } from '@ton-community/test-utils';

describe('NftDapp', () => {
    let code: Cell;
    let nftDapp: SandboxContract<NftDapp>
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        code = await compile('NftDapp');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');

        nftDapp = blockchain.openContract(
            NftDapp.createFromConfig({
                ownerAddress: owner.address,
                nextCollectionIndex: 0,
                collectionsDict: Dictionary.empty(Dictionary.Keys.Uint(256), Dictionary.Values.Address())
            }, code)
        );

        const deployer = await blockchain.treasury('deployer');
        const deployResult = await nftDapp.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: nftDapp.address,
            deploy: true,
        });
    });

    it('should mint collections and increase nextCollectionIndex', async () => {

        const collectionDataCell = buildNftCollectionDataCell({
            ownerAddress: owner.address,
            nextItemIndex: 0,
            collectionContent: '',
            commonContent: '',
            nftItemCode: await compile('AdminNft'),
            royaltyParams: {
                royaltyFactor: 12,
                royaltyBase: 100,
                royaltyAddress: randomAddress()
            },
        });
        
        const mintCollectionResult = await nftDapp.sendDeployCollectionMsg(owner.getSender(), {
            collectionCode: await compile('AdminCollection'),
            collectionData: collectionDataCell,
            queryId: Date.now(),
        });
        
        expect(mintCollectionResult.transactions).toHaveTransaction({
            from: owner.address,
            to: nftDapp.address,
            success: true
        });
        
       const nextCollectionIndex = await nftDapp.getNextCollectionIndex();
        
       expect(nextCollectionIndex).toBeGreaterThan(0);
    });

});


