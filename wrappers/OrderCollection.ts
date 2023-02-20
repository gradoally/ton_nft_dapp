import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type OrderCollectionConfig = {};

export function orderCollectionConfigToCell(config: OrderCollectionConfig): Cell {
    return beginCell().endCell();
}

export class OrderCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new OrderCollection(address);
    }

    static createFromConfig(config: OrderCollectionConfig, code: Cell, workchain = 0) {
        const data = orderCollectionConfigToCell(config);
        const init = { code, data };
        return new OrderCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
