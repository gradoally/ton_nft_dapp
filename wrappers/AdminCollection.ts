import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type AdminCollectionConfig = {};

export function adminCollectionConfigToCell(config: AdminCollectionConfig): Cell {
    return beginCell().endCell();
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
}
