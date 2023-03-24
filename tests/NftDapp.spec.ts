import { Blockchain, OpenedContract } from '@ton-community/sandbox';
import { Address, beginCell, Cell, Dictionary, toNano } from 'ton-core';
import { NftDapp, Opcodes } from '../wrappers/NftDapp';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { createKeys } from '../scripts/helpers/keys';
import { KeyPair, mnemonicNew, mnemonicToPrivateKey, sign } from 'ton-crypto';
import { randomAddress } from '../scripts/helpers/randomAddr';
import { CollectionCodeCell } from '../scripts/helpers/collectionCode';

describe('NftDapp', () => {
    let code: Cell;
    let nftDapp: OpenedContract<NftDapp>;
    let blockchain: Blockchain;
    let keypair: KeyPair

    beforeAll(async () => {
        code = await compile('NftDapp');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        keypair = await randomKeyPair();
        nftDapp = blockchain.openContract(
            NftDapp.createFromConfig({
                publicKey: keypair.publicKey,
                ownerAddress: randomAddress(),
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

    it('should sign', async () => {
        const collectionCodeCell = beginCell().storeRef(CollectionCodeCell).endCell();

        const toAddress = randomAddress();

        await nftDapp.sendUpdateCollectionMsg({
            code: collectionCodeCell,
            signFunc: (buf) => sign(buf, keypair.secretKey),
            amount: toNano('0.02'),
            address: toAddress,
            opCode: Opcodes.upgradeCollectionCode,
            queryId: Date.now(),
            collectionId: 0,
            seqno: 0,
        });
    });

    it('should sign msgDeployCollection', async () => {
        const collectionCodeCell = beginCell().storeRef(CollectionCodeCell).endCell();
        const collectionDataCell = beginCell().endCell();

        const toAddress = randomAddress();

        await nftDapp.sendDeployCollectionMsg({
            collectionCode: collectionCodeCell,
            collectionData: collectionDataCell,
            signFunc: (buf) => sign(buf, keypair.secretKey),
            amount: toNano('0.02'),
            address: toAddress,
            opCode: Opcodes.upgradeCollectionCode,
            queryId: Date.now(),
            collectionId: 0,
            seqno: 0,
        });
    });
});

export async function randomKeyPair() {
    let mnemonics = await mnemonicNew();
    return mnemonicToPrivateKey(mnemonics);
}
