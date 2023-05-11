import { NftDapp } from '../wrappers/NftDapp';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { randomAddress } from './helpers/randomAddr';
import { buildNftCollectionDataCell } from '../wrappers/utils/collectionHelpers';
import { sleep } from '@ton-community/blueprint/dist/utils';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    const collectionDataCell = buildNftCollectionDataCell({
      ownerAddress: address, 
      nextItemIndex: 0, 
      collectionContent: '',
      commonContent: '',
      nftItemCode: await compile('OrderNft'),
      royaltyParams: {
          royaltyFactor: 12,
          royaltyBase: 100,
          royaltyAddress: randomAddress()
      }
  });

    await nftDapp.sendDeployCollectionMsg(provider.sender(), {
        collectionCode: await compile('OrderCollection'),
        collectionData: collectionDataCell,
        value: toNano('0.051'),
        queryId: Date.now(),
    });

    sleep(3500);

    ui.write("Collection deployed!");
}

