import { beginCell, Cell, Dictionary } from 'ton-core'
//import { Cell, beginCell, Address, beginDict, Slice, toNano } from "ton";
import { Sha256 } from "@aws-crypto/sha256-js";

const ONCHAIN_CONTENT_PREFIX = 0x00;
const SNAKE_PREFIX = 0x00;
const OFF_CHAIN_CONTENT_PREFIX = 0x01

export function flattenSnakeCell(cell: Cell) {
  let c: Cell | null = cell

  let res = Buffer.alloc(0)

  while (c) {
    const cs = c.beginParse()
    if (cs.remainingBits === 0) {
      return res
    }
    if (cs.remainingBits % 8 !== 0) {
      throw Error('Number remaining of bits is not multiply of 8')
    }

    const data = cs.loadBuffer(cs.remainingBits / 8)
    res = Buffer.concat([res, data])
    c = c.refs && c.refs[0]
  }

  return res
}


function bufferToChunks(buff: Buffer, chunkSize: number) {
  const chunks: Buffer[] = []
  while (buff.byteLength > 0) {
    chunks.push(buff.slice(0, chunkSize))
    buff = buff.slice(chunkSize)
  }
  return chunks
}

export function makeSnakeCell(data: Buffer): Cell {
  const chunks = bufferToChunks(data, 127)

  if (chunks.length === 0) {
    return beginCell().endCell()
  }

  if (chunks.length === 1) {
    return beginCell().storeBuffer(chunks[0]).endCell()
  }

  let curCell = beginCell()

  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i]

    curCell.storeBuffer(chunk)

    if (i - 1 >= 0) {
      const nextCell = beginCell()
      nextCell.storeRef(curCell)
      curCell = nextCell
    }
  }

  return curCell.endCell()
}

export function encodeOffChainContent(content: string) {
  let data = Buffer.from(content)
  const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
  data = Buffer.concat([offChainPrefix, data])
  return makeSnakeCell(data)
}

export function decodeOffChainContent(content: Cell) {
  const data = flattenSnakeCell(content)

  const prefix = data[0]
  if (prefix !== OFF_CHAIN_CONTENT_PREFIX) {
    throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
  }
  return data.slice(1).toString()
}

export type ItemMetaDataKeys = 'name' | 'description' ;

const itemOnChainMetadataSpec: {
  [key in ItemMetaDataKeys]: 'utf8' | 'ascii' | undefined;
} = {
  name: 'utf8',
  description: 'utf8',
 // image: '',
};

const sha256 = (str: string) => {
  const sha = new Sha256();
  sha.update(str);
  return Buffer.from(sha.digestSync());
};

export function buildOnChainMetadataCell(data: { [s: string]: string | undefined }): Cell {
  const KEYLEN = 256;
  const dict = Dictionary.empty(Dictionary.Keys.Buffer(KEYLEN), Dictionary.Values.Cell());

  Object.entries(data).forEach(([k, v]: [string, string | undefined]) => {
      if (!itemOnChainMetadataSpec[k as ItemMetaDataKeys])
          throw new Error(`Unsupported onchain key: ${k}`);
      if (v === undefined || v === '') return;

      let bufferToStore = Buffer.from(v, itemOnChainMetadataSpec[k as ItemMetaDataKeys]);

      const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8);

      const rootCell = beginCell();
      rootCell.storeUint(SNAKE_PREFIX, 8);
      let currentCell = rootCell;

      while (bufferToStore.length > 0) {
          currentCell.storeBuffer(bufferToStore.subarray(0, CELL_MAX_SIZE_BYTES));
          bufferToStore = bufferToStore.subarray(CELL_MAX_SIZE_BYTES);
          if (bufferToStore.length > 0) {
              const newCell = beginCell();
              currentCell.storeRef(newCell);
              currentCell = newCell;
          }
      }

      dict.set(sha256(k), rootCell.asCell());
  });

  return beginCell().storeInt(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict).endCell();
}
