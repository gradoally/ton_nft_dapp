import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type CustomersNftConfig = {};

export function customersNftConfigToCell(config: CustomersNftConfig): Cell {
    return beginCell().endCell();
}

export class CustomersNft implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new CustomersNft(address);
    }

    static createFromConfig(config: CustomersNftConfig, code: Cell, workchain = 0) {
        const data = customersNftConfigToCell(config);
        const init = { code, data };
        return new CustomersNft(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
