import { crc32 } from "../../scripts/helpers/crc32";

export const Opcodes = {
    changeOwner: crc32("op::change_owner"),
    deployCollection: crc32("op::deploy_collection"),
    changeCollectionOwner: crc32("op::change_collection_owner"),
    deployNftItem: crc32("op::deploy_nft_item"),
    batchNftDeploy: crc32("op::batch_nft_deploy"),
    editCollectionContent: crc32("op::edit_collection_content"),
    withdrawFunds: crc32("op::withdraw_funds"),
    editDappCode: crc32("op::edit_dapp_code"),
    transferItem: crc32("op::transfer_item"),
    destroySbtItem: crc32("op::destroy_sbt_item"),
    editItemContent: crc32("op::edit_item_content")
};