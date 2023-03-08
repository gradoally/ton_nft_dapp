import { toNano, Address } from "ton-core";
import { compile, NetworkProvider } from "@ton-community/blueprint";
import { AdminCollection } from '../wrappers/AdminCollection';

export async function run(provider: NetworkProvider) {

  const contract = Address.parse('EQADBXugwmn4YvWsQizHdWGgfCTN_s3qFP0Ae0pzkU-jwzoE');  
  const openedContract = provider.open(contract);

  const sender = provider.sender();

  const mintCollectionMessage = 'Mint collection!';

  await openedContract.send(
    sender,
    {
      value: toNano("0.05"),
    },
    mintCollectionMessage
  );

  console.log(`Collection address: ${openedContract.address}`);
}

