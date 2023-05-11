import { Address, beginCell, DictionaryValue } from 'ton-core';

export type RoyaltyParams = {
  royaltyFactor: number;
  royaltyBase: number;
  royaltyAddress: Address;
};

export type CollectionMintNftEditable = {
    passAmount: bigint;
    index: number;
    ownerAddress: Address;
    editorAddress: Address;
    content: string;
};

export const MintNftDictValue: DictionaryValue<CollectionMintNftEditable> = {
    serialize(src, builder) {
      const nftItemMessage = beginCell();
  
      const itemContent = beginCell();
      itemContent.storeBuffer(Buffer.from(src.content));
  
      nftItemMessage.storeAddress(src.ownerAddress);
      nftItemMessage.storeAddress(src.editorAddress);
      nftItemMessage.storeRef(itemContent);
  
      builder.storeCoins(src.passAmount);
      builder.storeRef(nftItemMessage);
    },
    parse() {
      return {
        passAmount: 0n,
        index: 0,
        ownerAddress: new Address(0, Buffer.from([])),
        content: '',
        editorAddress: new Address(0, Buffer.from([])),
      }
    },
}  

export type CollectionMintSbtEditable = {
    passAmount: bigint;
    index: number;
    ownerAddress: Address;
    editorAddress: Address;
    authorityAddress: Address;
    content: string;
};

export const MintSbtDictValue: DictionaryValue<CollectionMintSbtEditable> = {
  serialize(src, builder) {
    const nftItemMessage = beginCell();

    const itemContent = beginCell();
    itemContent.storeBuffer(Buffer.from(src.content));

    nftItemMessage.storeAddress(src.ownerAddress);
    nftItemMessage.storeAddress(src.editorAddress);
    nftItemMessage.storeAddress(src.authorityAddress)
    nftItemMessage.storeRef(itemContent);

    builder.storeCoins(src.passAmount);
    builder.storeRef(nftItemMessage);
  },
  parse() {
    return {
      passAmount: 0n,
      index: 0,
      ownerAddress: new Address(0, Buffer.from([])),
      content: '',
      editorAddress: new Address(0, Buffer.from([])),
      authorityAddress: new Address(0, Buffer.from([]))
    }
  },
}  
