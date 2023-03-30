import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Opcodes } from '../wrappers/utils/opCodes';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { sign } from 'ton-crypto';
import { AdminCollectionCodeCell, CollectionCodeCell } from './helpers/collectionsCode';
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

   // const collectionsDictSize = await nftDapp.getNextCollectionIndex(); // current amount of deployed collections
 
    const collectionCodeCell = CollectionCodeCell;
    const collectionDataCell = beginCell()
                            .storeAddress(Address.parse("EQCAzGqV5MfFh2Bu42kTXfBdUHs3vd3-BOcu3Pnid-H5eB7l"))
                            .storeUint(0, 64)
                            .storeRef(beginCell().storeUint(randomSeed, 256).endCell())
                            .storeRef(NftItemCodeCell)
                            .storeRef(
                              beginCell()
                                .storeUint(12, 16)
                                .storeUint(100, 16)
                                .storeAddress(randomAddress())
                              .endCell()
                            )
                          .endCell();

    await nftDapp.sendDeployCollectionMsg({
        collectionCode: collectionCodeCell,
        collectionData: collectionDataCell,
        signFunc: (buf) => sign(buf, keypair.secretKey),
        amount: toNano('0.02'),
        address: randomAddress(),
        opCode: Opcodes.deployCollection,
        queryId: Date.now(),
        collectionId: 0,
        seqno: seqno,
    });

    ui.write("Collection deployed!");
}

