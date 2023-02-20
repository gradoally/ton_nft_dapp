import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type CustomersCollectionConfig = {};

export function customersCollectionConfigToCell(config: CustomersCollectionConfig): Cell {
    return beginCell().endCell();
}

export class CustomersCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new CustomersCollection(address);
    }

    static createFromConfig(config: CustomersCollectionConfig, code: Cell, workchain = 0) {
        const data = customersCollectionConfigToCell(config);
        const init = { code, data };
        return new CustomersCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
