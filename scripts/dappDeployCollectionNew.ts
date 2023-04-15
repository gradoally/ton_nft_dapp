import { NftDapp } from '../wrappers/NftDapp';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { AdminCollectionCodeCell, CollectionCodeCell } from './helpers/collectionsCode';
import { NftItemCodeCell } from './helpers/nftItemCode';
import { randomAddress } from './helpers/randomAddr';
import { randomSeed } from './helpers/randomSeed';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

   // const collectionsDictSize = await nftDapp.getNextCollectionIndex(); // current amount of deployed collections
 
    const collectionCodeCell = CollectionCodeCell;
    const collectionDataCell = beginCell()
                            .storeAddress(Address.parse("EQAYOUSnRhrWuzI-fjheXffT4ptStltkt7634zf159ls_Egf"))
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

    await nftDapp.sendDeployCollectionMsg(provider.sender(), {
        collectionCode: collectionCodeCell,
        collectionData: collectionDataCell,
        value: toNano('0.02'),
        queryId: 123,
        collectionId: 0,
    });

    ui.write("Collection deployed!");
}

