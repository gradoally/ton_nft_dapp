import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from '@ton-community/sandbox';
import { Address, Cell, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { buildNftCollectionDataCell } from '../wrappers/utils/collectionHelpers';
import { randomAddress } from '@ton-community/test-utils';
import { Opcodes } from '../wrappers/utils/opCodes';

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
                collectionsDict: Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address())
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

        console.log(nftDapp.address);

        await blockchain.setVerbosityForAddress(nftDapp.address, {
            print: true,
            blockchainLogs: false,
            debugLogs: false,
            vmLogs: 'vm_logs'
        });

        const collectionDataCell = buildNftCollectionDataCell({
            ownerAddress: owner.address,
            nextItemIndex: 0,
            collectionContent: '',
            commonContent: '',
            nftItemCode: await compile('OrderNFT'),
            royaltyParams: {
                royaltyFactor: 12,
                royaltyBase: 100,
                royaltyAddress: nftDapp.address
            },
        });
        
        const mintCollectionResult = await nftDapp.sendDeployCollectionMsg(owner.getSender(), {
            collectionCode: await compile('OrderCollection'),
            collectionData: collectionDataCell,
            queryId: 0,
        });
        
        expect(mintCollectionResult.transactions).toHaveTransaction({
            from: owner.address,
            to: nftDapp.address,
            success: true,
            outMessagesCount: 1
        });
        
       const nextCollectionIndex = await nftDapp.getNextCollectionIndex();
        
       expect(nextCollectionIndex).toBeGreaterThan(0);

       printTransactionFees(mintCollectionResult.transactions);

    });

});


