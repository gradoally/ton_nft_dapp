// Actually, we need to compile contract before setting initial data

import { Contract, ContractProvider, Sender, Address, Cell, contractAddress, beginCell, Builder } from "ton-core";
import { Dictionary, DictionaryKey, DictionaryKeyTypes, DictionaryValue } from "ton-core/dist/dict/Dictionary";

export default class EditableSbtOneTimeTransferItem implements Contract {

  static createForDeploy(code: Cell, 
    index: number, 
    collectionAddress: Address, 
    ownerAddress: Address, 
    contentDict: Dictionary<DictionaryKey<bigint> extends DictionaryKeyTypes, DictionaryValue<string>>,   // ?
    authorityAddress: Address, 
    editorAddress: Address,
    revokedAt: number
    ): EditableSbtOneTimeTransferItem {

    const data = beginCell()
      .storeUint(index, 64)
      .storeAddress(collectionAddress)
      .storeAddress(ownerAddress)
      .storeDict(contentDict)
      .storeAddress(authorityAddress)
      .storeAddress(editorAddress)
      .storeUint(revokedAt, 64)
      .endCell();
    const workchain = 0; 
    const address = contractAddress(workchain, { code, data });
    return new EditableSbtOneTimeTransferItem(address, { code, data });
  }

  constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) {}

  async sendDeploy(provider: ContractProvider, via: Sender) {
    await provider.internal(via, {
      value: "0.01", 
      bounce: false
    });
  }
}