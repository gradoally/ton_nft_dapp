import { toNano, Address } from "ton-core";
import { NetworkProvider } from "@ton-community/blueprint";
import { Dapp } from "./implementations/NftCollection";

export async function run(provider: NetworkProvider) {

  const contract = Dapp.fromAddress(Address.parse('EQADBXugwmn4YvWsQizHdWGgfCTN_s3qFP0Ae0pzkU-jwzoE'));  
  const openedContract = provider.open(contract);

  const sender = provider.sender();

  const mintCollectionMessage = 'DeployCollection!';

  await openedContract.send(
    sender,
    {
      value: toNano("0.05"),
    },
    mintCollectionMessage
  );

  console.log(`Collection address: ${openedContract.address}`);
}

