import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { CollectionCodeCell } from './helpers/collectionsCode';
import { randomAddress } from './helpers/randomAddr';
import { randomSeed } from './helpers/randomSeed';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

   // const collectionsDictSize = await nftDapp.getNextCollectionIndex(); // current amount of deployed collections

    const collectionDataCell = beginCell()
                            .storeAddress(Address.parse("EQARxWqNZakl_Ulh61RcYR4eHpm_0-t-FT2HNVsAGMSencjf"))
                            .storeUint(0, 64)
                            .storeRef(beginCell().storeUint(randomSeed, 256).endCell())
                            .storeRef(await compile('CustomersNft'))
                            .storeRef(
                              beginCell()
                                .storeUint(12, 16)
                                .storeUint(100, 16)
                                .storeAddress(randomAddress())
                              .endCell()
                            )
                          .endCell();

    await nftDapp.sendDeployCollectionMsg(provider.sender(), {
        collectionCode: CollectionCodeCell,
        collectionData: collectionDataCell,
        value: toNano('0.5'),
        queryId: Date.now(),
    });

    ui.write("Collection deployed!");
}

