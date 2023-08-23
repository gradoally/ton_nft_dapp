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

function stringToAsciiNumber(input: string): number {
    let asciiValue = 0;
    for (const char of input) {
        asciiValue += char.charCodeAt(0);
    }
    return asciiValue;
}

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
        }
    ) {

        const nftContent = Dictionary.empty(); // TO DO: form data dictionar

        // image
        nftContent.set(stringToAsciiNumber("image"), beginCell().storeStringTail("https://i.getgems.io/AE7mER7xxMuCGTg1l5VCm9FlKzA2dWnsgypJlkbeJnE/rs:fill:1000:0:1/g:ce/czM6Ly9nZXRnZW1zLXMzL25mdC1jb250ZW50LWNhY2hlL2ltYWdlcy9FUUR5V1pJb1RYdUVVYU02Uk90bktzMGxtdGtKVldFZzF2WE1pbW1fQV9yZE1JeUUvMGVmNjIxNmNlZWNhZTkyMA").endCell());
        // status_of_order
        nftContent.set(stringToAsciiNumber("status"), beginCell().storeStringTail("АКТИВНО").endCell());
        // name_of_order
        nftContent.set(stringToAsciiNumber("name_of_order"), beginCell().storeStringTail("Доработать мета-данные и память смарт-контракта").endCell());
        // amount
        nftContent.set(stringToAsciiNumber("amount"), beginCell().storeStringTail("1000000000").endCell());
        // order_description
        nftContent.set(stringToAsciiNumber("order_description"), beginCell().storeStringTail("Необходимо доработать смарт-контракт таким образом, что бы при деплое он хранил ссылку на одни метаданные, а после передачи собственности с кошелька владельца метаданные менялись на другие. Изначально элементы коллекции должны быть скрыты (по аналогии с лутбоксом). После продажи на маркетплейсе у владельца должен появиться").endCell());
        // technical_assigment
        nftContent.set(stringToAsciiNumber("technical_assigment"), beginCell().storeStringTail("4014BD338993CFA485CCB6DFAD0332443199F46D4CCF9F87BE1B7D76AA9038F0").endCell());
        // starting_unix_time
        nftContent.set(stringToAsciiNumber("starting_unix_time"), beginCell().storeStringTail("1691851283").endCell());
        // ending_unix_time
        nftContent.set(stringToAsciiNumber("ending_unix_time"), beginCell().storeStringTail("1691851283").endCell());
        // creation_unix_time
        nftContent.set(stringToAsciiNumber("creation_unix_time"), beginCell().storeStringTail("1691851283").endCell());
        // category
        nftContent.set(stringToAsciiNumber("category"), beginCell().storeStringTail("Разработка на блокчейне TON").endCell());
        // customer_addr
        nftContent.set(stringToAsciiNumber("customer_addr"), beginCell().storeStringTail("EQDWfTV0XtuUrRYF8BqOm1U2yr3axYlpvxxnGXyx2nwIypM3").endCell());

        const nftItemMessage = beginCell();

        nftItemMessage.storeDict(nftContent, Dictionary.Keys.Uint(1023), Dictionary.Values.Cell())

        await provider.internal(via, {
            value: toNano('0.2'),
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
                .storeUint(Opcodes.batchNftDeploy, 256)
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
                .storeUint(Opcodes.batchNftDeploy, 256)
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
                .storeUint(Opcodes.changeCollectionOwner, 256)
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
                .storeUint(Opcodes.editCollectionContent, 256)
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
                .storeUint(Opcodes.transferItem, 256)
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
                .storeUint(Opcodes.editItemContent, 256)
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
                .storeUint(Opcodes.destroySbtItem, 256)
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
                .storeUint(Opcodes.withdrawFunds, 256)
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
                .storeUint(Opcodes.editDappCode, 256)
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
                .storeUint(Opcodes.changeOwner, 256)
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