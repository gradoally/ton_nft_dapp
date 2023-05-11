import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { KeyPair, mnemonicNew, mnemonicToPrivateKey, sign } from 'ton-crypto';
import { randomAddress } from '../scripts/helpers/randomAddr';
import { randomKp } from './utils/randomKp';
import { buildNftCollectionDataCell } from '../wrappers/utils/collectionHelpers';

describe('NftDapp', () => {
    let code: Cell;
    let nftDapp: SandboxContract<NftDapp>
    let blockchain: Blockchain;
    let keypair: KeyPair;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        code = await compile('NftDapp');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        keypair = await randomKp();
        owner = await blockchain.treasury('owner');

        nftDapp = blockchain.openContract(
            NftDapp.createFromConfig({
                publicKey: keypair.publicKey,
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
            value: toNano('0.05'),
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


