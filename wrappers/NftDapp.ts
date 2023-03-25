import { 
    Address, 
    beginCell, 
    Cell, 
    Contract, 
    contractAddress, 
    ContractProvider, 
    Dictionary, 
    Sender, 
    SendMode, 
    external, 
    Builder, 
    internal, 
    storeMessageRelaxed,
} from 'ton-core';

import { Buffer } from 'buffer';
import { crc32 } from '../scripts/helpers/crc32';

export type NftDappConfig = {
    publicKey: Buffer;
    ownerAddress: Address;
    nextCollectionIndex: number;
    collectionsDict: Dictionary<number, Address>;

};

export function nftDappConfigToCell(config: NftDappConfig): Cell {
    return beginCell()
          .storeUint(0, 32)
          .storeBuffer(config.publicKey)   
          .storeAddress(config.ownerAddress)
          .storeUint(config.nextCollectionIndex, 64)
          .storeDict(config.collectionsDict)
        .endCell();
}

export const Opcodes = {
    changeOwner: crc32("op::change_owner"),
    deployCollection: crc32("op::deploy_collection"),
    changeCollectionOwner: crc32("op::change_collection_owner"),
    upgradeCollectionCode: crc32("op::upgrade_collection_code"),
    deployNftItem: crc32("op::deploy_nft_item")
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

    async sendDeployCollectionMsg(
        provider: ContractProvider,
        params: {
            collectionCode: Cell;
            collectionData: Cell;
            address: Address;
            amount: bigint;
            opCode: number;
            collectionId: number;
            queryId: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {
        const msg = internal({
            to: params.address,
            value: params.amount,
           // body: params.code,
    
        });

        const cellToSign = beginCell()
            .storeUint(params.seqno, 32)
            .storeUint(params.opCode, 32)
            .storeUint(params.queryId, 64)
            .storeUint(params.collectionId, 64)
            .storeRef(params.collectionCode)
            .storeRef(params.collectionData)
           // .storeRef(beginCell().store(storeMessageRelaxed(msg)).endCell())
            .endCell();

        const sig = params.signFunc(cellToSign.hash());

        await provider.external(
            beginCell()
              .storeBuffer(sig)
              .storeSlice(cellToSign.asSlice())
              .endCell()
        );
    }

    async sendDeployNftItemMsg(
        provider: ContractProvider,
        params: {
            itemIndex: number;
            itemContent: Cell;
            address: Address;
            amount: bigint;
            opCode: number;
            collectionId: number;
            queryId: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {
        const msg = internal({
            to: params.address,
            value: params.amount,
           // body: params.code,
    
        });

        const cellToSign = beginCell()
            .storeUint(params.seqno, 32)
            .storeUint(params.opCode, 32)
            .storeUint(params.queryId, 64)
            .storeUint(params.collectionId, 64)
            .storeUint(params.itemIndex, 64)
            .storeRef(params.itemContent)
            .endCell();

        const sig = params.signFunc(cellToSign.hash());

        await provider.external(
            beginCell()
              .storeBuffer(sig)
              .storeSlice(cellToSign.asSlice())
              .endCell()
        );

    }

    async sendChangeCollectionOwnerMsg(
        provider: ContractProvider,
        params: {
            newOwner: Address,
            address: Address;
            amount: bigint;
            opCode: number;
            collectionId: number;
            queryId: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {
        const msg = internal({
            to: params.address,
            value: params.amount,
         //   body: params.newOwner,
    
        });

        const cellToSign = beginCell()
            .storeUint(params.seqno, 32)
            .storeUint(params.opCode, 32)
            .storeUint(params.queryId, 64)
            .storeUint(params.collectionId, 64)
            .storeAddress(params.newOwner)
            .endCell();

        const sig = params.signFunc(cellToSign.hash());

        await provider.external(
            beginCell()
              .storeBuffer(sig)
              .storeSlice(cellToSign.asSlice())
              .endCell()
        );
    }

    async sendUpdateCollectionMsg(
        provider: ContractProvider,
        params: {
            code: Cell;
            address: Address;
            amount: bigint;
            opCode: number;
            collectionId: number;
            queryId: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {
        const msg = internal({
            to: params.address,
            value: params.amount,
            body: params.code,
    
        });

        const cellToSign = beginCell()
            .storeUint(params.seqno, 32)
            .storeUint(params.opCode, 32)
            .storeUint(params.queryId, 64)
            .storeUint(params.collectionId, 64)
            .storeRef(beginCell().store(storeMessageRelaxed(msg)).endCell())
            .endCell();

        const sig = params.signFunc(cellToSign.hash());

        await provider.external(
            beginCell()
              .storeBuffer(sig)
              .storeSlice(cellToSign.asSlice())
              .endCell()
        );
    }


    async getSeqno(provider: ContractProvider) {
        const result = await provider.get('get_seqno', []);
        return result.stack.readNumber();
    }

    async getDappData(provider: ContractProvider) {
        const result = await provider.get('get_dapp_data', []);
        return result.stack.readBuffer(), 
            result.stack.readAddress(), 
            result.stack.readBigNumber(), 
            result.stack.readCell();
    }
    
    async getNextCollectionIndex(provider: ContractProvider) {
        const result = await provider.get('get_dapp_data', []);
        return result.stack.readBigNumber();
    }
}
