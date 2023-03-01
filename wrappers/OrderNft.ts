import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode } from 'ton-core';

export type OrderNftConfig = {
    index: number;
    collectionAddress: Address;
    ownerAddress: Address;
    content: Dictionary<64, Cell>;
    authorityAddress: Address;
    editorAddress: Address;
    revokedAt: number;
};

export function orderNftConfigToCell(config: OrderNftConfig): Cell {
    return beginCell()
            .storeUint(config.index, 64)
            .storeAddress(config.collectionAddress)
            .storeAddress(config.ownerAddress)
            .storeDict(config.content)
            .storeAddress(config.authorityAddress)
            .storeAddress(config.editorAddress)
            .storeUint(config.revokedAt, 64)
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
}
