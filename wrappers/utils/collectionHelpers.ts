import { Address, beginCell, DictionaryValue } from 'ton-core';

export type CollectionMintItemInput = {
    passAmount: bigint;
    index: number;
    ownerAddress: Address;
    content: string;
};

export type RoyaltyParams = {
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address;
};

export const MintDictValue: DictionaryValue<CollectionMintItemInput> = {
    serialize(src, builder) {
      const nftItemMessage = beginCell();
  
      const itemContent = beginCell();
      itemContent.storeBuffer(Buffer.from(src.content));
  
      nftItemMessage.storeAddress(src.ownerAddress);
      nftItemMessage.storeRef(itemContent);
  
      builder.storeCoins(src.passAmount);
      builder.storeRef(nftItemMessage);
    },
    parse() {
      return {
        passAmount: 0n,
        index: 0,
        content: '',
        ownerAddress: new Address(0, Buffer.from([])),
        editorAddress: new Address(0, Buffer.from([])),
      }
    },
}  
