import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode } from 'ton-core';
import { Buffer } from 'buffer';
import { crc32 } from '../scripts/helpers/crc32';

export type NftDappConfig = {
    seqno: number;
    publicKey: Buffer;
    ownerAddress: Address;
    nextCollectionIndex: number;
    collectionsDict: Dictionary<number, Address>;

};

export function nftDappConfigToCell(config: NftDappConfig): Cell {
    return beginCell()
          .storeUint(config.seqno, 32)
          .storeBuffer(config.publicKey)   
          .storeAddress(config.ownerAddress)
          .storeUint(config.nextCollectionIndex, 64)
          .storeDict(config.collectionsDict)
        .endCell();
}

export const Opcodes = {
    changeOwner: crc32("op::change_owner"),
    deployCollection: crc32("op::deploy_collection")
};

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

    async sendChangeOwner(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newOwnerAddr: Address;
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.changeOwner, 32)
                .storeAddress(opts.newOwnerAddr)
                .endCell(),
        });
    }

    async someFunction(
        provider: ContractProvider,
        opts: {
            queryID?: number;
            signature: Buffer;
            seqno: number;
            collectionId: number;
            collectionCode: Cell;
            collectionData: Cell;
            value: bigint;
        }
    ) {

    await provider.external(
        beginCell()
            .storeBuffer(opts.signature)
            .storeUint(opts.seqno, 32)
            .storeUint(Opcodes.deployCollection, 32)
            .storeUint(opts.queryID ?? 0, 64)
            .storeUint(opts.collectionId, 64)
            .storeRef(opts.collectionCode)
            .storeRef(opts.collectionData)
        .endCell()
        );
    }

    async getSeqno(provider: ContractProvider) {
        const result = await provider.get('get_seqno', []);
        return result.stack.readNumber();
    }

    async getDappOwner(provider: ContractProvider) {
        const result = await provider.get('get_owner_addr', []);
        return result.stack.readAddress();
    }

}
