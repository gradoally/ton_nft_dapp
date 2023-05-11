import { Address, Cell, beginCell } from "ton-core";
import { encodeOffChainContent } from "./nftContent";

export type RoyaltyParams = {
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address;
};

export type NftCollectionData = {
    ownerAddress: Address;
    nextItemIndex: number | bigint;
    collectionContent: string;
    commonContent: string;
    nftItemCode: Cell;
    royaltyParams: RoyaltyParams;
};

export function buildNftCollectionDataCell(data: NftCollectionData): Cell {
    let dataCell = beginCell();

    dataCell.storeAddress(data.ownerAddress);
    dataCell.storeUint(data.nextItemIndex, 64);

    let contentCell = beginCell();

    let collectionContent = encodeOffChainContent(data.collectionContent);

    let commonContent = beginCell();
    commonContent.storeStringTail(data.commonContent);

    contentCell.storeRef(collectionContent);
    contentCell.storeRef(commonContent);
    dataCell.storeRef(contentCell);

    dataCell.storeRef(data.nftItemCode);

    let royaltyCell = beginCell();
    royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16);
    royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16);
    royaltyCell.storeAddress(data.royaltyParams.royaltyAddress);
    dataCell.storeRef(royaltyCell);

    return dataCell.endCell();
}