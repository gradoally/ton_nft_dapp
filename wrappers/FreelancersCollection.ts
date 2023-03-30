import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode, toNano } from 'ton-core';
import { randomSeed } from '../scripts/helpers/randomSeed';
import { Opcodes } from './utils/opCodes';
import { CollectionMintItemInput, MintDictValue } from './utils/collectionHelpers';

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

    // async sendDeployBatchMsg(provider: ContractProvider, via: Sender,
    //     opts: {
    //         value: bigint
    //         queryId: number
    //     }
    // ) {
    
    //     const nfts = Dictionary.empty(Dictionary.Keys.Uint(64), Dictionary.Values.Cell());
    //     nfts.set(1, beginCell().storeCoins(toNano('0.02')).storeRef(beginCell().storeUint(randomSeed, 256).endCell()).endCell());
    //     await provider.internal(via, {
    //         value: opts.value,
    //         sendMode: SendMode.PAY_GAS_SEPARATLY,
    //         body: beginCell()
    //             .storeUint(Opcodes.batchNftDeploy, 32)
    //             .storeUint(opts.queryId, 64)
    //             .storeDict(nfts)
    //             .endCell()
    //     });
    // }
    
    async sendDeployBatchMsg(provider: ContractProvider, via: Sender,
        params: {
            queryId: number; 
            value: bigint;
            items: CollectionMintItemInput[];
        }
    ) {
        if (params.items.length > 250) {
            throw new Error('Too long list');
        }
      
        const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintDictValue);
            for (const item of params.items) {
                dict.set(item.index, item);
            }

            await provider.internal(via, {
                value: params.value,
                    sendMode: SendMode.PAY_GAS_SEPARATLY,
                    body: beginCell()
                            .storeUint(Opcodes.batchNftDeploy, 32)
                            .storeUint(params.queryId, 64)
                            .storeDict(dict)
                        .endCell()
            });
          
    }
}
