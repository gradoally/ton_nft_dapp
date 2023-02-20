import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type FreelancersNftConfig = {};

export function freelancersNftConfigToCell(config: FreelancersNftConfig): Cell {
    return beginCell().endCell();
}

export class FreelancersNft implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new FreelancersNft(address);
    }

    static createFromConfig(config: FreelancersNftConfig, code: Cell, workchain = 0) {
        const data = freelancersNftConfigToCell(config);
        const init = { code, data };
        return new FreelancersNft(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
