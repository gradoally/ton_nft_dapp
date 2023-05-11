import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode, toNano } from 'ton-core';

export type FreelancersCollectionConfig = {
    ownerAddress: Address;
    nextItemIndex: number;
    content: Cell;
    nftItemCode: Cell;
    royaltyParams: Cell;
};

export function freelancersCollectionConfigToCell(config: FreelancersCollectionConfig): Cell {
    return beginCell()
            .storeAddress(config.ownerAddress)
            .storeUint(config.nextItemIndex, 64)
            .storeRef(config.content)
            .storeRef(config.nftItemCode)
            .storeRef(config.royaltyParams)
        .endCell();
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
