# Tokenized Decentralized Backend template 

TDBt is a tokenized decentralized backend template on TON, that reveals the main principles of building and launching Multi-User, Mass-Adoptable & Scalable Decentralized apps and services such as freelance-exchanges, bulletin boards, taxi, etc. TDBt. is built upon a strong foundation of TON, conceptions of NFT & NFT-Collections, conception of Decentralization itself. We developed the ideas lying behind the concept of editable NFT’s (mainly used for minting so-called “loot-box” NFT collections) offering to apply NFT for a wider range of use-cases. In fact, we propose to think and develop in the paradigm, in which we perceive NFT and Jettons as units, that allow us to store, retrieve, update and even process data (because we can easily extend NFT Standards easily), needed to represent practically entities in blockchain. We are convinced that this approach can lead to creation of a vast variety of complex and useful apps, usage of which we can already experience in Web 2.0, but decentralized. Our technology opens up the possibility to build practically any backend in blockchain, using the power of Jettons, NFT, Collections & the new type of smart-contracts, that we have developed — Token Decentralized Backend smart-contract (further, TDBs), that is needed to conduct and manage all NFT Collections and Jetton-masters under his responsibility. By building this new layer, we automaze & consolidate the process of governing NFT Collections & Jettons, making TDBs an owner & editor of all Collections & Jetton-masters within one single app. This gives us an opportunity to build a vast variety of processes within blockchain representing different entities in the form of NFT Collections & Jettons, needed for the app to work (e.g. freelance-exchange basically needs representation of freelancers, contractors, ads & admins on it’s backend). Apart from that we provide an opportunity to easily interact with the app, as TDBs becomes the main access-point to all functions of the app. We kept the code of NFT and NFT-Collections, but extended its functionality to meet the user-stories and other requirements in our first implementation.

## Bird’s eye view

TDBt deployed to blockchain looks like a layered, growing, updatable & upgradable network of smart-contracts sending messages and interacting with each other asynchronously. Basically it has three layers: NFT layer, NFT Collections layer & top layer consisting of just one contract – TDBs that acts as the index & master contract on the top of all layers. Messages go between these layers from top to bottom. Each layer is responsible for its own scope of duties and responsibilities.

### NFT layer

This is the essential layer of smart-contracts that stores the largest amount of data of the app. In fact, to build an app using principles of TDBt we use an abstraction of NFT to represent any entity, no matter if it is a sword in a computer game, taxi-driver's passport or a smart-contract of a voting game. When developing the app on the principles of TDBt. you can implement different NFT Standards, according to your needs. For instance, if you make a freelance-exchange, you may represent each contractor’s ad in the form of NFT, as well as each contractor’s or freelancer’s profile, as well as admin’s NFT that gives him certain rights. In general, we can represent vast amounts of entities in the form of NFT as it can store practically any metadata & files, such as images, video, pdf, music & so on. We propose to store metadata on-chain to easily edit and manipulate individual attributes. Depending on the particular entity that we represent in the form of NFT, we use different NFT Standards, modify & extend them, if needed.

### NFT Collections layer

Contracts of this layer are based on the existing standard of TON NFT Editable Collection. We inherit the general idea and conception of NFT Collections (grouping and managing NFT) and add some specific functions, data structures and get-methods that we need for certain interactions, depending on their type.

### TDBs

This smart contract forms the top layer of the whole smart-contract network. It performs various functions related to managing collections of tokens. Those functions allow us to effectively manage all the smart-contracts in the network. Let’s stipulate it’s main functions:

* It keeps track of some important information about the contract, such as the sequence number, public key, owner's address, the index of the next collection, and a dictionary of collections. 
* The contract allows the owner to change the ownership of the contract to a new address. 
* The owner can withdraw funds from the contract, but only if the balance is sufficient. 
* The owner can edit the code of the contract. 
* The contract allows the deployment of new collections. Each collection has its own code and data. 
* The contract allows the deployment of individual items within a collection. 
* The contract supports batch deployment of multiple items within a collection.
* The owner can edit the content of a collection. 
* The owner can change the ownership of a collection to a new address.
* The owner can edit the content of an item within a collection. 
* The owner can destroy an SBT item within a collection. 
* The owner can revoke ownership of an SBT within a collection. 
* The owner can transfer ownership of an item to another address. 
* The contract provides methods to retrieve the balance of the contract and the sequence number. 
* The contract can receive messages from external sources and perform certain actions based on the received message. 
* The contract provides getters to retrieve the contract's data, including the public key, owner's address, next collection index, and a list of deployed collection addresses.

## Features

This section describes basic technical features (functional atoms) that make TDBt work. Please take note that you can manage all the interactions described (except get-methods for retrieving data) by sending messages to TDBs (top-layer smart-contract), that will (if needed) proxy the message to the smart-contracts of the layer at the bottom, and so on.

### Deal with Smart-Contracts

TDBt provides basic features to manage smart-contracts within your app.

#### Mint smart-contracts:

There are three ways to mint new smart-contracts to the network of your TDA

* Collection Deployment | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/nft_dapp.fc#L116) | – function of TDBs that allows you to mint new collections that will be put under the governance of TDBs.

* NFT Item Deployment | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/nft_dapp.fc#L134) | – You can deploy individual NFT Items in collections through TDBs. Message will pass through TDBs, then will be forwarded to the corresponding NFT Collection, that in its term will send a message to the empty address that will mint a new smart-contract of NFT.

* Batch NFT Deploy | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/nft_dapp.fc#L152) | – You can deploy multiple NFT with a single transaction.

#### Change code of smart-contracts:

This methods will help you to upgrade the smart-contracts in your TDA:

* Edit dApp Code | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/nft_dapp.fc#L422) | – You can upgrade the code of the main smart-contract (TDBs).

* Edit Collection Code (coming soon)

* Edit NFT Code (coming soon)

#### Delete smart-contracts

You can even implement functions that will allow you to burn tokens, such as:

* Destroy SBT Item | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/nft_dapp.fc#LL215C1-L215C1) | – You can burn SBT tokens in collections of SBT type. Message will pass through TDBs, then will be forwarded to the corresponding NFT Collection, that in its term will send a message to SBT Item to be burned.

* Delete dApp (coming soon)

* Delete NFT (coming soon)

* Delete NFT Collection (coming soon)

### Deal with Data

TBDs provide functions to deal with data from your app.

#### Store Data

You can mint a new smart-contract to blockchain to store new data. So you can use methods for creating smart-contracts described in p. 3.1.1 for that purpose.

#### Update Data

You can take advantage of the Editable NFT Standard to update data in smart-contract by just editing it. You can use following methods for that purpose:

* Edit Collection Content | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/nft_dapp.fc#L168) | – You can update content and metadata of NFT Collections through TDBs. It will forward the message to the corresponding collection.

* Edit NFT Item Content | [see code ↗] | – You can update content and metadata of NFT through TDBs. It will forward the message to the corresponding collection and collection, in its term will forward the message to the NFT Item.

#### Retrieve Data

* Use TDAs Get-Methods | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/nft_dapp.fc#L438) | – In TDBt you will find methods that will allow you to get the current sequence number, get TDA data, get deployed collections addresses.

* Use Collection Get-Methods | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/customers_collection.fc#L147) | – For example, in collections of freelancers of TDBt you will find methods that will allow you to collect data, get NFT addresses by index, get royalty params, get NFT content.

* Use NFT Get-Methods | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/customers_collection.fc#L147) | – You can get NFT Content or the address of the editor by running NFT get-methods inherited from the NFT Standart.

#### Process Data (Coming soon)

### Deal with App

Owners of TDA have additional functionality and opportunities to maintain, scale and improve the app.

#### Own & Benefit Securely

Here are essential functions and opportunities for owners of the app:

* Change dApp Owner | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/nft_dapp.fc#L75) | – You can change the owner of the TDA, for example, you can migrate from ordinary wallet to multisig wallet, or DAO smart-contract.

* Withdraw Funds | [see code ↗](https://github.com/somewallet/ton_nft_dapp/blob/212e9f9c8f2d832ebfe7d2224e4599a512eedbbb/contracts/nft_dapp.fc#L84) | – You can withdraw funds to the address that is owner of the TDA
Manage TDA Collectively – You can make a multisig or DAO smart-contract.

#### Upgrade TDA

You can upgrade your app using methods described in p. 3.1.2.

#### Build UI

You can build a serverless frontend for your TDA, using TON SDK’s. For example, you can use TON Connect demo app as a starting JS template.



### TDA Concept

Tokenized Decentralized App (TDA) is a novel approach that combines the advantages of Tokenized Decentralized Backend (TDB) with a serverless frontend. The core idea behind TDA is to enable seamless app functionality by extracting all necessary information from the TDB smart-contract network. By leveraging the capabilities of blockchain and smart contracts, TDA empowers developers to build robust, transparent, and decentralized applications.

To illustrate the concept, let's consider an example of a freelance marketplace. With TDA, the app can retrieve real-time data by parsing the collection of freelance orders directly from the TDB smart-contract network. This allows for the dynamic generation of an actual list of available orders, eliminating the need for a centralized backend system. The TDA can extract and display relevant information such as order statuses, contractors, responsible freelancers, and more, providing users with up-to-date details.

The interaction between the TDA and smart contracts is bidirectional. When users engage in various processes within the app, they can trigger changes in the corresponding smart contracts by sending messages or transactions. For instance, accepting an order or updating its status can be accomplished by interacting with the smart contract representing that specific order. These actions are transparent, auditable, and secure due to the immutability and consensus mechanisms of the underlying blockchain network.

By tokenizing the app's functionalities and integrating them with the blockchain infrastructure, TDA introduces several benefits. Firstly, it ensures data integrity and immutability since the information is stored on the blockchain. This enhances trust and eliminates the need for centralized intermediaries. Secondly, TDA leverages the decentralized nature of blockchain to create a resilient and censorship-resistant app ecosystem. It is no longer reliant on a single point of failure, reducing the vulnerability to hacking, downtime, or data breaches.

Moreover, TDA enables a more inclusive and collaborative environment by allowing users to participate directly in the governance and decision-making processes through smart contracts. Tokenized incentives can be implemented, rewarding users who contribute to the network with tokens for their computational resources, data sharing, or other valuable contributions.

In summary, TDA harnesses the power of Tokenized Decentralized Backend and combines it with a serverless frontend to create a new paradigm of decentralized application development. By leveraging smart contracts and blockchain technology, TDA offers enhanced transparency, security, and user empowerment. This innovative approach opens up a world of possibilities for building decentralized applications that are efficient, trustworthy, and resilient, with potential applications spanning various industries and sectors.

## Repository Structure

The main file of interest is `nft_dapp.fc`, which contains the implementation of the TON NFT dApp contract in FunC language. The `utils/` directory provides utility functions and helper scripts used by the contract. The `imports/` directory contains imported FunC libraries for various functionalities. The `tests/` directory includes test cases and scripts to validate the contract's functionality.


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

Read full description in Whitepaper:
https://docs.google.com/document/d/18D-HhM01Hrp-iv0Y6r5J2hbmIly7Xvyrvi3AmJPblyw/edit#heading=h.5b97pxsnhdfe