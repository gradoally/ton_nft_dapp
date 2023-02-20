import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type FreelancersCollectionConfig = {};

export function freelancersCollectionConfigToCell(config: FreelancersCollectionConfig): Cell {
    return beginCell().endCell();
}

export class FreelancersCollection implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new FreelancersCollection(address);
    }

    static createFromConfig(config: FreelancersCollectionConfig, code: Cell, workchain = 0) {
        const data = freelancersCollectionConfigToCell(config);
        const init = { code, data };
        return new FreelancersCollection(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
