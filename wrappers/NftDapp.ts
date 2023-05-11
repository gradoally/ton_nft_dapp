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
} from 'ton-core';

import { Buffer } from 'buffer';
import { Opcodes } from './utils/opCodes';
import { CollectionMintNftEditable, CollectionMintSbtEditable, MintNftDictValue, MintSbtDictValue } from './utils/nftMintHelpers';
import { RoyaltyParams } from './utils/collectionHelpers';
import { encodeOffChainContent } from './utils/nftContent';

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
                .storeRef(opts.collectionCode)
                .storeRef(opts.collectionData)
                .endCell(),
        });
    }

    async sendDeployItemMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            itemIndex: number;
            itemContent: string;
            value: bigint;
            collectionId: number;
            queryId: number;
            itemOwnerAddress: Address;
            itemAuthorityAddress?: Address;
            itemEditorAddress: Address;
        }
    ) {

        const nftContent = beginCell();
        nftContent.storeBuffer(Buffer.from(opts.itemContent));

        const nftItemMessage = beginCell();

        nftItemMessage.storeAddress(opts.itemOwnerAddress);
        nftItemMessage.storeRef(nftContent);
        nftItemMessage.storeAddress(opts.itemAuthorityAddress);  // This line is for SBT
        nftItemMessage.storeAddress(opts.itemEditorAddress);

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
            nfts: CollectionMintNftEditable[];
            value: bigint;
            collectionId: number;
            queryId: number;
        }
    ) {
        if (opts.nfts.length > 250) {
            throw new Error('Too long list');
        }
      
        const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintNftDictValue);
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

    async sendBatchSbtDeployMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            sbts: CollectionMintSbtEditable[];
            value: bigint;
            collectionId: number;
            queryId: number;
        }
    ) {
        if (opts.sbts.length > 250) {
            throw new Error('Too long list');
        }
      
        const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintSbtDictValue);
            for (const item of opts.sbts) {
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

    async sendEditCollectionContentMsg(
        provider: ContractProvider,
        via: Sender,
        opts: { 
            collectionContent: string;
            commonContent: string;
            royaltyParams: RoyaltyParams;
            value: bigint;
            collectionId: number;
            queryId: number;
        }
    ) {

        const royaltyCell = beginCell();
        royaltyCell.storeUint(opts.royaltyParams.royaltyFactor, 16);
        royaltyCell.storeUint(opts.royaltyParams.royaltyBase, 16);
        royaltyCell.storeAddress(opts.royaltyParams.royaltyAddress);

        const contentCell = beginCell();

        const collectionContent = encodeOffChainContent(opts.collectionContent);

        const commonContent = beginCell();
        commonContent.storeBuffer(Buffer.from(opts.commonContent));

        contentCell.storeRef(collectionContent);
        contentCell.storeRef(commonContent);

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.editCollectionContent, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.collectionId, 64)
                .storeRef(contentCell)
                .storeRef(royaltyCell)
            .endCell()
        });
    }

    async sendTransferItemMsg(provider: ContractProvider, via: Sender,
        opts: {
            queryId: number;
            value: bigint;
            newOwner: Address;
            itemAddress: Address;
            responseAddress: Address;
            fwdAmount?: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.transferItem, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.itemAddress)
                .storeAddress(opts.newOwner)
                .storeAddress(opts.responseAddress)
                .storeCoins(opts.fwdAmount || 0)
            .endCell(),
        });
    }

    async sendEditItemContentMsg(provider: ContractProvider, via: Sender,
        opts: {
            queryId: number;
            value: bigint;
            itemAddress: Address;
            newContent: string;
        }
    ) {

        const nftContent = beginCell();
        nftContent.storeBuffer(Buffer.from(opts.newContent));

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.editItemContent, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.itemAddress)
                .storeRef(nftContent)
            .endCell(),
        });
    }

    async sendDestroySbtMsg(provider: ContractProvider, via: Sender,
        opts: {
            queryId: number;
            value: bigint;
            itemAddress: Address;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.destroySbtItem, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.itemAddress)
            .endCell(),
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

    async getSeqno(provider: ContractProvider): Promise<number> {
        const result = await provider.get('get_seqno', []);
        return result.stack.readNumber();
    }

    async getDappData(provider: ContractProvider): Promise<{ownerAddress: Address, nextCollectionIndex: number}> {
        const result = await provider.get('get_dapp_data', []);
        let ownerAddress = result.stack.readAddress();
        let nextCollectionIndex = result.stack.readNumber();
        return {
            ownerAddress,
            nextCollectionIndex
        };
    }

    async getDappOwner(provider: ContractProvider): Promise<Address> {
        let res = await this.getDappData(provider);
        return res.ownerAddress;
    }
    
    async getNextCollectionIndex(provider: ContractProvider): Promise<number> {
        let res = await this.getDappData(provider);
        return res.nextCollectionIndex;
    }
    
    async getStateBalance(provider: ContractProvider): Promise<bigint> {
        const state = await provider.getState();
        return state.balance;
    }

}

