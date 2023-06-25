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
    toNano,  
} from 'ton-core';

import { Buffer } from 'buffer';
import { Opcodes } from './utils/opCodes';
import { CollectionMintNftEditable, CollectionMintSbtEditable, MintNftDictValue, MintSbtDictValue } from './utils/nftMintHelpers';
import { RoyaltyParams } from './utils/collectionHelpers';
import { buildOnChainMetadataCell, ItemMetaDataKeys } from './utils/nftContent';

export type NftDappConfig = {
    ownerAddress: Address;
    nextCollectionIndex: number;
    collectionsDict: Dictionary<number, Address>;
};

export function nftDappConfigToCell(config: NftDappConfig): Cell {
    return beginCell()   
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
    
    async sendDeployCollectionMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            collectionCode: Cell;
            collectionData: Cell;
            queryId: number;
        }
    ) {

        await provider.internal(via, {
            value: toNano('0.1'),
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
            collectionId: number;
            queryId: number;
            itemOwnerAddress: Address;
            itemAuthorityAddress?: Address;
            itemEditorAddress?: Address;
        }
    ) {

     //   const nftContent = Dictionary.empty(); // TO DO: form data dictionary

        const nftItemMessage = beginCell();

        nftItemMessage.storeAddress(opts.itemOwnerAddress);
        nftItemMessage.storeAddress(opts.itemAuthorityAddress);  // This line is for SBT
        nftItemMessage.storeAddress(opts.itemEditorAddress);
      //  nftItemMessage.storeDict(nftContent);

        await provider.internal(via, {
            value: toNano('0.05'),
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
            value: toNano('0.05') * BigInt(dict.size),
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
            value: toNano('0.05') * BigInt(dict.size),
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
            collectionContent: { [s in ItemMetaDataKeys]?: string | undefined };
            commonContent: string;
            royaltyParams: RoyaltyParams;
            collectionId: number;
            queryId: number;
        }
    ) {

        const royaltyCell = beginCell();
        royaltyCell.storeUint(opts.royaltyParams.royaltyFactor, 16);
        royaltyCell.storeUint(opts.royaltyParams.royaltyBase, 16);
        royaltyCell.storeAddress(opts.royaltyParams.royaltyAddress);

        const contentCell = beginCell();

        const collectionContent = buildOnChainMetadataCell(opts.collectionContent);

        const commonContent = beginCell();
        commonContent.storeBuffer(Buffer.from(opts.commonContent));

        contentCell.storeRef(collectionContent);
        contentCell.storeRef(commonContent);

        await provider.internal(via, {
            value: toNano('0.05'),
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

    async sendTransferItemMsg(
        provider: ContractProvider, 
        via: Sender,
        opts: {
            queryId: number;
            newOwner: Address;
            itemAddress: Address;
            responseAddress: Address;
            fwdAmount?: bigint;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
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

    async sendEditItemContentMsg(
        provider: ContractProvider, 
        via: Sender,
        opts: {
            queryId: number;
            itemAddress: Address;
            newContent: string;
        }
    ) {

        const nftContent = beginCell();
        nftContent.storeBuffer(Buffer.from(opts.newContent));

        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.editItemContent, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.itemAddress)
                .storeRef(nftContent)
            .endCell(),
        });
    }

    async sendDestroySbtMsg(
        provider: ContractProvider, 
        via: Sender,
        opts: {
            queryId: number;
            itemAddress: Address;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.destroySbtItem, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.itemAddress)
            .endCell(),
        });
    }

    async sendWithdrawMsg(
        provider: ContractProvider, 
        via: Sender,
        opts: {
            withdrawAmount: bigint;
            queryId: number;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.withdrawFunds, 32)
                .storeUint(opts.queryId, 64)
                .storeCoins(opts.withdrawAmount)
            .endCell(),
        });
    }

    async sendUpdateDappCodeMsg(
        provider: ContractProvider, 
        via: Sender,
        opts: {
            newCode: Cell;
            queryId: number;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.editDappCode, 32)
                .storeUint(opts.queryId, 64)
                .storeRef(opts.newCode)
            .endCell(),
        });
    }

    async sendChangeDappOwnerMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newOwner: Address;
            queryId: number;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATLY,
            body: beginCell()
                .storeUint(Opcodes.changeOwner, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.newOwner)
            .endCell(),
        });
    }

    async getDappOwner(provider: ContractProvider): Promise<Address> {
        let res = (await provider.get('get_dapp_data', [])).stack;
        return res.readAddress();
    }
    
    async getNextCollectionIndex(provider: ContractProvider): Promise<number> {
        let res = (await provider.get('get_dapp_data', [])).stack;
        res.skip(1);
        return res.readNumber();
    }
    
    async getStateBalance(provider: ContractProvider): Promise<bigint> {
        const state = await provider.getState();
        return state.balance;
    }

}

