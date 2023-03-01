import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, DictionaryKey, Sender, SendMode } from 'ton-core';

export type NftDappConfig = {
    seqno: number;
    publicKey: number;
    ownerAddress: Address;
    nextCollectionIndex: number;
    collectioinsDict: Dictionary<64, Address>;

};


// let dict = Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Address());


export function nftDappConfigToCell(config: NftDappConfig): Cell {
    return beginCell()
          .storeUint(config.seqno, 32)
          .storeUint(config.publicKey, 256)   // storeUint ??
          .storeAddress(config.ownerAddress)
          .storeUint(config.nextCollectionIndex, 64)
          .storeDict(config.collectioinsDict)
        .endCell();
}

export class NftDapp implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftDapp(address);
    }

    static createFromConfig(config: NftDappConfig, code: Cell, workchain = 0) {
        const data = nftDappConfigToCell(config);
        const init = { code, data };
        return new NftDapp(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell().endCell(),
        });
    }
}
