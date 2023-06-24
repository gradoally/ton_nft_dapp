import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from '@ton-community/sandbox';
import { Cell, Dictionary, toNano } from 'ton-core';
import { OrderNft } from '../wrappers/OrderNft';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';

describe('OrderNft', () => {
    let code: Cell;
    let orderNft: SandboxContract<OrderNft>
    let blockchain: Blockchain;
    let sender: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        code = await compile('OrderNft');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        sender = await blockchain.treasury('sender');

        orderNft = blockchain.openContract(
            OrderNft.createFromConfig({
                ownerAddress: sender.address,
                editorAddress: randomAddress(),
                index: 0,
                content: new Cell(),
                collectionAddress: randomAddress()
            }, code)
        );

        const deployer = await blockchain.treasury('deployer');
        const deployResult = await orderNft.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: orderNft.address,
            deploy: true,
        });
    });

    it('should transfer', async () => {
        const res = await orderNft.sendTransfer(sender.getSender(), {
            queryId: 0,
            value: toNano('0.1'),
            newOwner: randomAddress(),
            responseAddress: randomAddress(),
            fwdAmount: toNano('0.05')
        });

        expect(res.transactions).toHaveTransaction({
            from: sender.address,
            to: orderNft.address,
            success: true
        })
    })
})