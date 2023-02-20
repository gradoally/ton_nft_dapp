import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type OrderNftConfig = {};

export function orderNftConfigToCell(config: OrderNftConfig): Cell {
    return beginCell().endCell();
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
