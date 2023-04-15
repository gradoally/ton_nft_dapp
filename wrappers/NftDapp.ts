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
    internal, 
    storeMessageRelaxed,
} from 'ton-core';

import { Buffer } from 'buffer';
import { Opcodes } from './utils/opCodes';
import { CollectionMintItemInput, MintDictValue } from './utils/collectionHelpers';

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

    // Internal
    
    async sendDeployCollectionMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            collectionCode: Cell;
            collectionData: Cell;
            collectionId: number;
            queryId: number;
            value: bigint;
        }
    ) {

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.deployCollection, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.collectionId, 64)
                .storeRef(opts.collectionCode)
                .storeRef(opts.collectionData)
                .endCell(),
        });
    }

    async sendDeployNftItemMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            itemIndex: number;
            itemContent: string;
            value: bigint;
            address: Address;
            collectionId: number;
            queryId: number;
            itemOwnerAddress: Address;
        }
    ) {

        const itemContent = beginCell();
        itemContent.storeBuffer(Buffer.from(opts.itemContent));

        const nftItemMessage = beginCell();

        nftItemMessage.storeAddress(opts.itemOwnerAddress);
        nftItemMessage.storeRef(itemContent);

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.deployNftItem, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.collectionId, 64)
                .storeUint(opts.itemIndex, 64)
                .storeRef(nftItemMessage)
            .endCell()
        });

    }

    async sendBatchNftDeployMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            nfts: CollectionMintItemInput[];
            address: Address;
            value: bigint;
            collectionId: number;
            queryId: number;
        }
    ) {
        if (opts.nfts.length > 250) {
            throw new Error('Too long list');
        }
      
        const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintDictValue);
            for (const item of opts.nfts) {
                dict.set(item.index, item)
            }

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.batchNftDeploy, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.collectionId, 64)
                .storeDict(dict)
            .endCell()
        });
    }

    async sendChangeCollectionOwnerMsg(
        provider: ContractProvider,
        via: Sender,
        opts: { 
            newOwner: Address;
            address: Address;
            value: bigint;
            collectionId: number;
            queryId: number;
        }
    ) {

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.changeCollectionOwner, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.collectionId, 64)
                .storeAddress(opts.newOwner)
            .endCell()
        });
    }

    async sendEditNftContentMsg(
        provider: ContractProvider,
        via: Sender,
        opts: { 
            newContent: Cell;
            royaltyParams: Cell;
            address: Address;
            value: bigint;
            collectionId: number;
            queryId: number;
        }
    ) {

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.editCollectionContent, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.collectionId, 64)
                .storeRef(opts.newContent)
                .storeRef(opts.royaltyParams)
            .endCell()
        });
    }


    // External 

    async sendWithdrawMsg(provider: ContractProvider,
        opts: {
            value: bigint;
            amount: bigint;
            opCode: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {
    
        const cellToSign = beginCell()
            .storeUint(opts.seqno, 32)
            .storeUint(opts.opCode, 32)
            .storeCoins(opts.amount)
            .endCell();

        const sig = opts.signFunc(cellToSign.hash());

        await provider.external(
            beginCell()
              .storeBuffer(sig)
              .storeSlice(cellToSign.asSlice())
              .endCell()
        );
    }

    async sendUpdateDappCodeMsg(provider: ContractProvider, 
        opts: {
            newCode: Cell;
            value: bigint;
            opCode: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {
        const cellToSign = beginCell()
            .storeUint(opts.seqno, 32)
            .storeUint(opts.opCode, 32)
            .storeRef(opts.newCode)
            .endCell();

        const sig = opts.signFunc(cellToSign.hash());

        await provider.external(
            beginCell()
              .storeBuffer(sig)
              .storeSlice(cellToSign.asSlice())
              .endCell()
        );
    }

    async sendChangeDappOwnerMsg(provider: ContractProvider,
        opts: {
            newOwner: Address;
            value: bigint;
            opCode: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {
        const cellToSign = beginCell()
            .storeUint(opts.seqno, 32)
            .storeUint(opts.opCode, 32)
            .storeAddress(opts.newOwner)
            .endCell();

        const sig = opts.signFunc(cellToSign.hash());

        await provider.external(
            beginCell()
              .storeBuffer(sig)
              .storeSlice(cellToSign.asSlice())
              .endCell()
        );
    }

    async getSeqno(provider: ContractProvider) : Promise<number> {
        const result = await provider.get('get_seqno', []);
        return result.stack.readNumber();
    }

    async getDappData(provider: ContractProvider) : Promise<[Buffer, Address, bigint, Cell]> {
        const result = await provider.get('get_dapp_data', []);
        return [ 
            result.stack.readBuffer(), 
            result.stack.readAddress(), 
            result.stack.readBigNumber(), 
            result.stack.readCell() 
        ];
    }
    
    async getStateBalance(provider: ContractProvider): Promise<bigint> {
        const state = await provider.getState()
        return state.balance;
    }

}

