// src/nexus/ledger.ts
// Consulta directa al ledger NXST (ICRC-1), evitando el composite query
// balance() del minter -- que además sólo soporta consultar al propio caller.
import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { getAgent, getMinterCanisterId, getUserSubaccount } from "./client.js";

const NXST_LEDGER_CANISTER_ID = "ls35s-zaaaa-aaaap-qumfa-cai";

interface Account {
  owner: Principal;
  subaccount: [] | [Uint8Array];
}

interface LedgerService {
  icrc1_balance_of: (account: Account) => Promise<bigint>;
}

const ledgerIdlFactory = ({ IDL }: { IDL: any }) => {
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  return IDL.Service({
    icrc1_balance_of: IDL.Func([Account], [IDL.Nat], ["query"]),
  });
};

let cachedLedgerActor: LedgerService | null = null;

async function getLedgerActor(): Promise<LedgerService> {
  if (cachedLedgerActor) return cachedLedgerActor;
  const agent = await getAgent();
  cachedLedgerActor = Actor.createActor<LedgerService>(ledgerIdlFactory as any, {
    agent,
    canisterId: Principal.fromText(NXST_LEDGER_CANISTER_ID),
  });
  return cachedLedgerActor;
}

// El subaccount es determinístico y puro (función sólo del principal) --
// una vez resuelto, se cachea para siempre. Se pierde sólo al reiniciar
// el proceso, lo cual es aceptable acá.
const subaccountCache = new Map<string, Uint8Array>();

async function resolveSubaccount(principal: Principal): Promise<Uint8Array> {
  const key = principal.toText();
  if (subaccountCache.has(key)) return subaccountCache.get(key)!;

  const subaccount = await getUserSubaccount(principal);
  subaccountCache.set(key, subaccount);
  return subaccount;
}

// Balance NXST de un usuario, consultado directamente en el ledger.
export async function getNxstBalance(principal: Principal): Promise<bigint> {
  const subaccount = await resolveSubaccount(principal);
  const actor = await getLedgerActor();

  const account: Account = {
    owner: Principal.fromText(getMinterCanisterId()),
    subaccount: [subaccount], // Opt(Blob) en candid-js = array de 0 o 1 elemento
  };

  return actor.icrc1_balance_of(account);
}