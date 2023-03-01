import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type AdminNftConfig = {
    index: number;
    collectionAddress: Address;
    ownerAddress: Address;
    content: Cell;
    authorityAddress: Address;
    editorAddress: Address;
    revokedAt: number;
};

export function adminNftConfigToCell(config: AdminNftConfig): Cell {
    return beginCell()
           .storeUint(config.index, 64)
           .storeAddress(config.collectionAddress)
           .storeAddress(config.ownerAddress)
           .storeRef(config.content)
           .storeAddress(config.authorityAddress)
           .storeAddress(config.editorAddress)
           .storeUint(config.revokedAt, 64)
        .endCell();
}

export class AdminNft implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new AdminNft(address);
    }

    static createFromConfig(config: AdminNftConfig, code: Cell, workchain = 0) {
        const data = adminNftConfigToCell(config);
        const init = { code, data };
        return new AdminNft(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
