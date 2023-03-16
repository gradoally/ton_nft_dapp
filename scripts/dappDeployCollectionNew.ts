import { NftDapp, Opcodes } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { sign, KeyPair } from 'ton-crypto';
import { createKeys } from './deployNftDapp';
import { CollectionCodeCell } from './helpers/collectionCode';
import { NftItemCodeCell } from './helpers/nftItemCode';
import { randomAddress } from './helpers/randomAddr';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    // const seqno = await nftDapp.getSeqno();

    const msg = beginCell()
          .storeUint(0, 32) // seqno
          .storeUint(Opcodes.deployCollection, 32)
          .storeUint(0, 64) // queryId
          .storeUint(0, 64) // collectionId
          .storeRef(CollectionCodeCell)  // collection code
          .storeRef(
             beginCell()
               .storeAddress(Address.parse("EQBNHgU3GiNnGewebGogIfblJhInOtKkbO6knXDXQ24BBOJX")) // owner addr
               .storeUint(1, 64) // next item index
               .storeRef(new Cell()) // content
               .storeRef(NftItemCodeCell) // nft item code
               .storeRef(
                  beginCell()
                  .storeUint(12, 16)
                  .storeUint(100, 16)
                  .storeAddress(randomAddress())
             .endCell()) // royalty params
           )  // collection data
        .endCell();

    const hash = msg.hash();

    await nftDapp.someFunction(provider.provider(address), {

        signature: sign(hash, (await createKeys()).secretKey),
        seqno: 0,
        collectionId: 0,
        collectionCode: CollectionCodeCell,
        collectionData: beginCell()
                    .storeRef(
                      beginCell()
                      .storeAddress(Address.parse("EQBNHgU3GiNnGewebGogIfblJhInOtKkbO6knXDXQ24BBOJX")) // owner addr
                      .storeUint(1, 64) // next item index
                      .storeRef(new Cell()) // content
                      .storeRef(NftItemCodeCell) // nft item code
                      .storeRef(
                         beginCell()
                          .storeUint(12, 16)
                          .storeUint(100, 16)
                          .storeAddress(randomAddress())
                         .endCell()
                       ) 
                    )  
                    .endCell(),
        value: toNano('0.05')
    });

    ui.write("Collection deployed!");
}

