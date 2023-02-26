import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type MultisigConfig = {};

export function multisigConfigToCell(config: MultisigConfig): Cell {
    return beginCell().endCell();
}

export class Multisig implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Multisig(address);
    }

    static createFromConfig(config: MultisigConfig, code: Cell, workchain = 0) {
        const data = multisigConfigToCell(config);
        const init = { code, data };
        return new Multisig(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
