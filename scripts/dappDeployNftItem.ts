import { NftDapp } from '../wrappers/NftDapp';
import { Opcodes } from '../wrappers/utils/opCodes';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';
import { sign } from 'ton-crypto';
import { createKeys } from './helpers/keys';
import { randomAddress } from './helpers/randomAddr';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dapp address'));

    const nftDapp = provider.open(NftDapp.createFromAddress(address));

    const keypair = await createKeys();

    const seqno = await nftDapp.getSeqno();

    await nftDapp.sendDeployNftItemMsg({
            itemIndex: 0,
            passAmount: toNano('0.02'),
            itemOwnerAddress: Address.parse('EQCAzGqV5MfFh2Bu42kTXfBdUHs3vd3-BOcu3Pnid-H5eB7l'),
            itemContent: '',
            signFunc: (buf) => sign(buf, keypair.secretKey),
            amount: toNano('0.02'),
            address: randomAddress(),
            opCode: Opcodes.deployNftItem,
            queryId: Date.now(),
            collectionId: 0,
            seqno: seqno,
    });

    ui.write("Nft item successfully deployed!");
}

