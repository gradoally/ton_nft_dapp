import { Blockchain, OpenedContract } from '@ton-community/sandbox';
import { Cell, Dictionary, toNano } from 'ton-core';
import { NftDapp } from '../wrappers/NftDapp';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { KeyPair, mnemonicNew, mnemonicToPrivateKey, sign } from 'ton-crypto';
import { randomAddress } from '../scripts/helpers/randomAddr';

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

});

export async function randomKeyPair() {
    let mnemonics = await mnemonicNew();
    return mnemonicToPrivateKey(mnemonics);
}
