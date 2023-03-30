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

    async sendWithdrawMsg(provider: ContractProvider, via: Sender,
        opts: {
            value: bigint;
            amount: bigint;
        }
    ) {
    
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.withdrawFunds, 32)
                .storeCoins(opts.amount)
                .endCell()
        });
    }

    async sendUpdateDappCodeMsg(provider: ContractProvider, via: Sender, 
        opts: {
            newCode: Cell;
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.editDappCode, 32)
                .storeRef(opts.newCode)
                .endCell(),
        });
    }

    async sendChangeDappOwnerMsg(provider: ContractProvider, via: Sender, 
        opts: {
            newOwner: Address;
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.changeOwner, 32)
                .storeAddress(opts.newOwner)
                .endCell(),
        });
    }


    // External 

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

        const cellToSign = beginCell()
            .storeUint(params.seqno, 32)
            .storeUint(params.opCode, 32)
            .storeUint(params.queryId, 64)
            .storeUint(params.collectionId, 64)
            .storeRef(params.collectionCode)
            .storeRef(params.collectionData)
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
            passAmount: bigint;
            itemOwnerAddress: Address;
            itemIndex: number;
            itemContent: string;
            address: Address;
            amount: bigint;
            opCode: number;
            collectionId: number;
            queryId: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {

        const itemContent = beginCell();
        itemContent.storeBuffer(Buffer.from(params.itemContent));

        const nftItemMessage = beginCell();

        nftItemMessage.storeAddress(params.itemOwnerAddress);
        nftItemMessage.storeRef(itemContent);

        const cellToSign = beginCell()
            .storeUint(params.seqno, 32)
            .storeUint(params.opCode, 32)
            .storeUint(params.queryId, 64)
            .storeUint(params.collectionId, 64)
            .storeUint(params.itemIndex, 64)
            .storeCoins(params.passAmount)
            .storeRef(nftItemMessage)
            .endCell();

        const sig = params.signFunc(cellToSign.hash());

        await provider.external(
            beginCell()
              .storeBuffer(sig)
              .storeSlice(cellToSign.asSlice())
              .endCell()
        );

    }

    async sendBatchNftDeployMsg(
        provider: ContractProvider,
        params: {
            nfts: CollectionMintItemInput[];
            address: Address;
            amount: bigint;
            opCode: number;
            collectionId: number;
            queryId: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {
        if (params.nfts.length > 250) {
            throw new Error('Too long list');
        }
      
        const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintDictValue);
            for (const item of params.nfts) {
                dict.set(item.index, item)
            }

            const cellToSign = beginCell()
            .storeUint(params.seqno, 32)
            .storeUint(params.opCode, 32)
            .storeUint(params.queryId, 64)
            .storeUint(params.collectionId, 64)
            .storeDict(dict)
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
            newOwner: Address;
            address: Address;
            amount: bigint;
            opCode: number;
            collectionId: number;
            queryId: number;
            signFunc: (buf: Buffer) => Buffer;
            seqno: number;
        }
    ) {
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

    // async getDappOwner(provider: ContractProvider) : Promise<Address> {
    //     const result = await provider.get('get_dapp_data', []);
    //     return result.stack.readAddress();
    // }
    
    async getStateBalance(provider: ContractProvider): Promise<bigint> {
        const state = await provider.getState()
        return state.balance;
    }

}

