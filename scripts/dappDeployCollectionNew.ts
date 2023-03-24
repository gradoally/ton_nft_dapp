import { NftDapp, Opcodes } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { sign } from 'ton-crypto';
import { CollectionCodeCell } from './helpers/collectionCode';
import { NftItemCodeCell } from './helpers/nftItemCode';
import { createKeys } from './helpers/keys';
import { randomAddress } from './helpers/randomAddr';
import { randomSeed } from './helpers/randomSeed';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    const keypair = await createKeys();

    const seqno = await nftDapp.getSeqno();

    const collectionsDictSize = await nftDapp.getNextCollectionIndex(); // current amount of deployed collections
 
    const collectionCodeCell = beginCell().storeRef(CollectionCodeCell).endCell();
    const collectionDataCell = beginCell()
                            .storeAddress(randomAddress())
                            .storeUint(0, 64)
                            .storeRef(beginCell().storeUint(randomSeed, 256).endCell())
                            .storeRef(beginCell().storeRef(NftItemCodeCell).endCell())
                            .storeRef(
                              beginCell()
                                .storeUint(12, 16)
                                .storeUint(100, 16)
                                .storeAddress(randomAddress())
                              .endCell()
                            )
                          .endCell();

    nftDapp.sendDeployCollectionMsg({
        collectionCode: collectionCodeCell,
        collectionData: collectionDataCell,
        signFunc: (buf) => sign(buf, keypair.secretKey),
        amount: toNano('0.02'),
        address: randomAddress(),
        opCode: Opcodes.deployCollection,
        queryId: Date.now(),
        collectionId: 0,
        seqno: seqno,
    })

    // const msg = beginCell()
    //       .storeUint(seqno, 32) // seqno
    //       .storeUint(Opcodes.deployCollection, 32)
    //       .storeUint(0, 64) // queryId
    //       .storeUint(0, 64) // collectionId
    //       .storeRef(CollectionCodeCell)  // collection code
    //       .storeRef(
    //          beginCell()
    //            .storeAddress(Address.parse("EQBEMxgQUG00VwOAvmPYfZbOQwllVU5zEIahLLKmtej43K3Y")) // owner addr 
    //            .storeUint(0, 64) // next item index
    //            .storeRef(beginCell().storeUint(randomSeed, 256).endCell()) // content
    //            .storeRef(NftItemCodeCell) // nft item code
    //            .storeRef(
    //               beginCell()
    //               .storeUint(12, 16)
    //               .storeUint(100, 16)
    //               .storeAddress(randomAddress())
    //          .endCell()) // royalty params
    //        )  // collection data
    //     .endCell();

    // const hash = msg.hash();

    // await nftDapp.someFunction(provider.provider(address), {

    //     signature: sign(hash, (await createKeys()).secretKey),
    //     seqno: seqno,
    //     collectionId: 0,
    //     collectionCode: CollectionCodeCell,
    //     collectionData: beginCell()
    //                 .storeRef(
    //                   beginCell()
    //                   .storeAddress(Address.parse("EQBEMxgQUG00VwOAvmPYfZbOQwllVU5zEIahLLKmtej43K3Y")) 
    //                   .storeUint(0, 64) 
    //                   .storeRef(beginCell().storeUint(randomSeed, 256).endCell()) 
    //                   .storeRef(NftItemCodeCell) 
    //                   .storeRef(
    //                      beginCell()
    //                       .storeUint(12, 16)
    //                       .storeUint(100, 16)
    //                       .storeAddress(randomAddress())
    //                      .endCell()
    //                    ) 
    //                 )  
    //                 .endCell(),
    //     value: toNano('0.05')
    // });

    ui.write("Collection deployed!");
}

