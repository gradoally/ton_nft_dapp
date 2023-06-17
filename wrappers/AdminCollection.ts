import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';
import { Opcodes } from './utils/opCodes';

export type AdminCollectionConfig = {
    ownerAddress: Address;
    nextItemIndex: number;
    content: Cell;
    nftItemCode: Cell;
    royaltyParams: Cell;
};

export function adminCollectionConfigToCell(config: AdminCollectionConfig): Cell {
    return beginCell()
            .storeAddress(config.ownerAddress)
            .storeUint(config.nextItemIndex, 64)
            .storeRef(config.content)
            .storeRef(config.nftItemCode)
            .storeRef(config.royaltyParams)
        .endCell();
}

export class AdminCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new AdminCollection(address);
    }

    static createFromConfig(config: AdminCollectionConfig, code: Cell, workchain = 0) {
        const data = adminCollectionConfigToCell(config);
        const init = { code, data };
        return new AdminCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }

    async sendMint(provider: ContractProvider, via: Sender, 
        opts: {
            value: bigint;
            queryId: number;
            itemIndex: number;
            itemOwnerAddress: Address;
            itemEditorAddress: Address;
            itemAuthorityAddress: Address;
            //itemContent: string;
            amount: bigint;
        }
    ) {

        // const nftContent = beginCell();
        // nftContent.storeBuffer(Buffer.from(opts.itemContent));

        const nftMessage = beginCell();

        nftMessage.storeAddress(opts.itemOwnerAddress);
        nftMessage.storeAddress(opts.itemAuthorityAddress);
        nftMessage.storeAddress(opts.itemEditorAddress)
        //nftMessage.storeRef(nftContent);

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.deployNftItem, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.itemIndex, 64)
                .storeCoins(opts.amount)
                .storeRef(nftMessage)
            .endCell(),
        });
    }
}
