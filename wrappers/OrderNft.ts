import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode } from 'ton-core';

export type OrderNftConfig = {
    index: number;
    collectionAddress: Address;
    ownerAddress: Address;
    content: Cell;
    editorAddress: Address;
};

export function orderNftConfigToCell(config: OrderNftConfig): Cell {
    return beginCell()
            .storeUint(config.index, 64)
            .storeAddress(config.collectionAddress)
            .storeAddress(config.ownerAddress)
            .storeRef(config.content)
            .storeAddress(config.editorAddress)
        .endCell();
}

export class OrderNft implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new OrderNft(address);
    }

    static createFromConfig(config: OrderNftConfig, code: Cell, workchain = 0) {
        const data = orderNftConfigToCell(config);
        const init = { code, data };
        return new OrderNft(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }

    async sendTransfer(provider: ContractProvider, via: Sender,
        opts: {
            queryId: number;
            value: bigint;
            newOwner: Address;
            responseAddress?: Address;
            fwdAmount?: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(0x5fcc3d14, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.newOwner)
                .storeAddress(opts.responseAddress || null)
                .storeBit(false) // no custom payload
                .storeCoins(opts.fwdAmount || 0)
                .storeBit(false) // no forward payload
            .endCell(),
        });
    }
}
