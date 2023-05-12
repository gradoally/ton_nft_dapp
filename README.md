# TON NFT dApp

Welcome to the TON NFT dApp repository! TON NFT dApp is a decentralized backend solution on TON, that provides the opportunity to launch Multi-User decentralized apps and services such as freelance-exchanges, bulletin boards, taxi, etc. General idea is to use NFT and NFT-collections smart-contracts as units to store data, e.g. if we want to build a freelance exchange we will need the collections of freelancers, orders, customers and moderators. To operate multiple collections that store the main data of the app we developed a special master-contract that becomes the editor and owner of all collections, making it possible to automate the processes of minting and editing NFT. Master-contract becomes some sort of API for the frontend, as we can call it’s methods to execute some functions or to get some information. TON itself in this case acts as some sort of database, as we can just parse the collection of orders to get all the orders. We can parse the attributes of order’s NFT to get any information about the order, as such attributes as order status, address of freelancer, executing this order, and so on will be stored on-chain as NFT’s metadata. It’s hard to imagine what functionality we can build using editable NFT in this way. Apart from that we plan to include jetton-master and jetton-wallet into this system as well to make it possible for the apps to use jettons as their in-app or in-game currency.

## General idea

In this project we try to use NFT and NFT-collections as units to store data. We use a special master-contract that you can find in [contracts/nft_dapp.fc] (contracts/nft_dapp.fc), through which new collections that store main assets of the app can be deployed, e.g. for freelance-marketplace we can deploy the NFT collections of orders, freelancers, admins and users, that will allow us to store main data of the app in the form of NFT. Apart from that, master-contract becomes the owner and editor of all collections. Being an owner and editor of all collections, master-contract can initiate the minting of NFT and edit them. That allows us to keep actual data in blockchain, e.g. when the status of order changes from "New" to "In progress", we just send the request to edit this NFT to the master-contract, and it, in it's tern, edits the corresponding NFT (status is stored on-chain as an attribute of NFT). You can find general architecture of different dApps that can be built with this technology [here](https://www.figma.com/file/cGnh50NM7Ni5MpCRO7BojP/Untitled?type=whiteboard&node-id=0-1&t=O7aWKnzcDzzGojxa-0)

## Key features

1. Master-contract is a “gate” for interacting with the app, so all requests from “outwhere” go to it, accordingly master-contract gives all the responses.
2. Different standards of NFT can be implemented within the app, depending on the type of data stored, e.g. in taxi app driver's passports can be issued in the form of NFT and you can imlement Soulbound NFT for that purpose
3. We plan to get actual data from blockchain by parsing new blocks and running get-methods of the master-contract
4. We interact with the master-contract by sending external messages signed with the private key to it, master-contract in it's tern can send messages to other contracts of the app (being the owner and editor of all collections).
5. We extended NFT Standards in a way that they send a notification to master-contract after successful deploy, but we made our best to keep NFT and NFT Collections code as it is in the current standards.
6. We don't use IPFS to store metadata but we store it on-chain in order to allow faster editing of NFT content.

## Repository Structure

The main file of interest is `nft_dapp.fc`, which contains the implementation of the TON NFT dApp contract in FunC language. The `utils/` directory provides utility functions and helper scripts used by the contract. The `imports/` directory contains imported FunC libraries for various functionalities. The `tests/` directory includes test cases and scripts to validate the contract's functionality.

## Contract Overview

The TON NFT dApp contract follows a specific structure and implements various functions for managing collections of non-fungible tokens. Here are some key aspects of the contract:

### Storage

The contract's storage includes the following variables:

- `seqno`: An `int32` representing the sequence number.
- `public_key`: An `int256` representing the public key.
- `dapp_owner`: A `slice` representing the address of the dApp owner.
- `next_collection_index`: An `int64` representing the index of the next collection.
- `collections_dict`: A `cell` storing the dictionary of collections.

### Functions

The contract provides several functions for different operations, including:

- `load_data()`: Loads the contract's data from storage.
- `save_data()`: Saves the contract's data to storage.
- `change_owner()`: Changes the owner of the dApp.
- `withdraw_funds()`: Allows the owner to withdraw funds from the contract.
- `edit_code()`: Edits the code of the contract.
- `return_collection_addr_by_id()`: Returns the address of a collection based on its ID.
- `deploy_collection()`: Deploys a new collection.
- `deploy_item()`: Deploys a new item within a collection.
- `batch_nft_deploy()`: Deploys multiple items within a collection.
- `edit_collection_content()`: Edits the content of a collection.
- `change_collection_owner()`: Changes the owner of a collection.
- `edit_item_content()`: Edits the content of an item.
- `destroy_sbt_item()`: Destroys an item.
- `revoke_sbt_item()`: Revokes an item.
- `transfer_item()`: Transfers an item to a new owner.
- `get_smc_balance()`: Retrieves the contract's balance.
- `recv_internal()`: Handles internal messages received by the contract.
- `recv_external()`: Handles external messages received by the contract.
- Getter functions to retrieve specific data from the contract.

## Usage

To use the TON NFT dApp contract, you need to deploy it on the TON blockchain. You can compile the `nft_dapp.fc` file using the FunC compiler and deploy the resulting smart contract to the TON network.

Once deployed, you can interact with the contract by sending messages to its address. The contract provides various functions for managing collections and items within those collections. You can call these functions by crafting the appropriate message with the required parameters and sending it to the contract.

To test the contract's functionality, you can explore the `tests/` directory, which contains test cases and scripts to help you validate the contract's behavior.

## Freelance-exchange implementation description

To build a freelance exchange dApp on the TON blockchain using NFT technology, you can leverage the master-contract and NFT collections provided by the TON NFT dApp repository. Here's how you can use this technology to create the freelance exchange dApp:

1. **Deploying NFT Collections**: Using the master-contract from the repository, you can deploy NFT collections that will store the main assets of the freelance exchange dApp. For example, you can deploy NFT collections for orders, freelancers, employers, and admins. These collections will serve as units to store relevant data associated with each category.

2. **Storing Data as NFTs**: With the NFT collections deployed, you can use the NFTs to store the main data of the freelance exchange dApp. Each NFT within a collection represents a unique entity such as an order, a freelancer, an employer, or an admin. You can associate metadata with each NFT to store additional information about the entity, such as the freelancer's skills, the order details, or the employer's preferences.

3. **Master-Contract Ownership and Editing**: The master-contract becomes the owner and editor of all the deployed NFT collections. As the owner and editor, the master-contract has the authority to initiate the minting of NFTs and edit their attributes. This allows for the maintenance of up-to-date data on the blockchain. For example, when the status of an order changes, the freelance exchange dApp can send a request to the master-contract to update the corresponding NFT's status attribute.

4. **Data Updates via Master-Contract**: When a change occurs in the freelance exchange dApp, such as the status of an order or the details of a freelancer, the dApp can interact with the master-contract to request the necessary updates. The dApp can send a message to the master-contract, specifying the NFT and the attribute to be edited. The master-contract then processes the request and updates the corresponding NFT attribute accordingly.

5. **Blockchain-based Data Storage**: By utilizing NFTs and storing data on the TON blockchain, the freelance exchange dApp ensures that the important information, such as order statuses, freelancer details, and employer preferences, are securely stored and tamper-resistant. The data is kept on-chain, allowing for transparency and immutability.

6. **Additional Functionality**: In addition to the core functionality of storing and updating data, you can enhance the freelance exchange dApp by adding features such as NFT transfers between users, tracking transaction history, implementing payment mechanisms using blockchain tokens, and creating a user-friendly front-end interface to interact with the dApp.

By using the NFT technology provided by the TON NFT dApp repository, you can create a decentralized freelance exchange dApp on the TON blockchain. This approach allows for the storage of key data as NFTs and leverages the master-contract's ownership and editing capabilities to maintain and update the data on-chain, ensuring transparency and reliability within the freelance exchange ecosystem.

## Contributing

Contributions to the TON NFT dApp contract are welcome!