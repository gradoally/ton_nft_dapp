import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    contractAddress,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    TupleBuilder,
  } from "ton-core";

import { ContractSystem, ContractExecutor } from "ton-emulator";

  export type Deploy = {
    $$type: "Deploy";
    queryId: bigint;
  };
  
  export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
      let b_0 = builder;
      b_0.storeUint(2490013878, 32);
      b_0.storeUint(src.queryId, 64);
    };
  }
  
  async function Dapp_init(
    owner: Address,
  ) {
    const __init =
      "te6ccgEBCAEA2wABFP8A9KQT9LzyyAsBAgFiAgMCAswEBQANoUrc3kfgFQAB3AJhtOALtngJtngPkZgOqkCg7Z4sKQICA54AJZmZkKCGoEcCAgOeAQICA54AA54tkgOZkwYGAULIcQHLB28AAW+MbW+MAds8byIByZMhbrOWAW8iWczJ6DEHALog10oh10mXIMIAIsIAsY5KA28igH8izzGrAqEFqwJRVbYIIMIAnCCqAhXXGFAzzxZAFN5ZbwJTQaHCAJnIAW8CUEShqgKOEjEzwgCZ1DDQINdKIddJknAg4uLoXwM=";
    const __code =  // dapp base64 code
      "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";
    const __system =
      "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";
    let systemCell = Cell.fromBase64(__system);
    let builder = new TupleBuilder();
    builder.writeCell(systemCell);
    builder.writeAddress(owner);
  
    let __stack = builder.build();
    let codeCell = Cell.fromBoc(Buffer.from(__code, "base64"))[0];
    let initCell = Cell.fromBoc(Buffer.from(__init, "base64"))[0];
    let system = await ContractSystem.create();
    let executor = await ContractExecutor.create({ code: initCell, data: new Cell() }, system);
    let res = await executor.get("init", __stack);
    if (!res.success) {
      throw Error(res.error);
    }
    if (res.exitCode !== 0 && res.exitCode !== 1) {
      if (NftCollection_errors[res.exitCode]) {
        throw new ComputeError(NftCollection_errors[res.exitCode].message, res.exitCode, { logs: res.logs });
      } else {
        throw new ComputeError("Exit code: " + res.exitCode, res.exitCode, { logs: res.logs });
      }
    }
  
    let data = res.stack.readCell();
    return { code: codeCell, data };
  }
  
  const NftCollection_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack undeflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    13: { message: `Out of gas error` },
    32: { message: `Method ID not found` },
    34: { message: `Action is invalid or not supported` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
  };
  
  export class Dapp implements Contract {
    static async init(
      owner: Address,
    ) {
      return await Dapp_init(owner);
    }
  
    static async fromInit(
      owner: Address,
    ) {
      const init = await Dapp_init(owner);
      const address = contractAddress(0, init);
      return new Dapp(address, init);
    }
  
    static fromAddress(address: Address) {
      return new Dapp(address);
    }
  
    readonly address: Address;
    readonly init?: { code: Cell; data: Cell };
    readonly abi: ContractABI = {
      errors: NftCollection_errors,
    };
  
    private constructor(address: Address, init?: { code: Cell; data: Cell }) {
      this.address = address;
      this.init = init;
    }
  
    async send(
      provider: ContractProvider,
      via: Sender,
      args: { value: bigint; bounce?: boolean | null | undefined },
      message: "DeployCollection!" | Deploy
    ) {
      let body: Cell | null = null;
      if (message === "DeployCollection!") {
        body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
      }
      if (message && typeof message === "object" && !(message instanceof Slice) && message.$$type === "Deploy") {
        body = beginCell().store(storeDeploy(message)).endCell();
      }
      if (body === null) {
        throw new Error("Invalid message type");
      }
  
      await provider.internal(via, { ...args, body: body });
    }
  
  }

  