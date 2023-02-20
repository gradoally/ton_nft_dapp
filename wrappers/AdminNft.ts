import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type AdminNftConfig = {};

export function adminNftConfigToCell(config: AdminNftConfig): Cell {
    return beginCell().endCell();
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
