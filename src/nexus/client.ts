import { HttpAgent, Actor, ActorSubclass } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { getIdentity } from "../identity/signer.js";
import { idlFactory } from "../declarations/minter.did.js";

const MINTER_CANISTER_ID = "l4zq2-cqaaa-aaaap-qumea-cai";
const HOST = "https://icp-api.io";

export type CanisterResult<T, E> = { Ok: T } | { Err: E };

export interface NexusUser {
  principal: Principal;
  name?: [string];
  email?: [string];
}

export interface BridgeResult {
  ok: boolean;
  blockIndex?: bigint;
  error?: any;
}

export interface DiscordUserResult {
  ok: boolean;
  user?: NexusUser;
  error?: any;
}

let cachedAgent: HttpAgent | null = null;
let cachedActor: ActorSubclass<any> | null = null;

// Agente compartido — reutilizable por cualquier módulo que necesite
// hablar con otro canister (ej. el ledger) sin recrear el HttpAgent.
export async function getAgent(): Promise<HttpAgent> {
  if (cachedAgent) return cachedAgent;
  const identity = getIdentity();
  cachedAgent = await HttpAgent.create({ host: HOST, identity });
  return cachedAgent;
}

export async function getNexusActor(): Promise<ActorSubclass<any>> {
  if (cachedActor) return cachedActor;
  const agent = await getAgent();
  cachedActor = Actor.createActor(idlFactory, {
    agent,
    canisterId: Principal.fromText(MINTER_CANISTER_ID),
  });
  return cachedActor;
}

export function getMinterCanisterId(): string {
  return MINTER_CANISTER_ID;
}

// Transferencia NXT entre dos usuarios, ejecutada por el minter a pedido
// del bridge (Q310). amount va en unidades mínimas (ya escalado por decimales).
export async function bridgeTransferNXT(
  fromPrincipal: Principal,
  toPrincipal: Principal,
  amount: bigint
): Promise<BridgeResult> {
  const actor = await getNexusActor();
  const result: CanisterResult<bigint, any> = await actor.bridgeTransferNXT({
    from: fromPrincipal,
    to: toPrincipal,
    amount,
  });

  if ("Ok" in result) {
    return { ok: true, blockIndex: result.Ok };
  }
  return { ok: false, error: result.Err };
}

// Realiza la quema de NXT desde la cuenta de un usuario a través del canister Minter.
export async function bridgeBurnNXTFrom(
  fromPrincipal: Principal,
  amount: bigint
): Promise<BridgeResult> {
  const actor = await getNexusActor();
  const result: CanisterResult<bigint, any> = await actor.bridgeBurnNXTFrom({
    from: fromPrincipal,
    amount,
  });

  if ("Ok" in result) {
    return { ok: true, blockIndex: result.Ok };
  }
  return { ok: false, error: result.Err };
}

// Realiza el minteo de NXT a favor de un usuario a través del canister Minter.
export async function bridgeMintNXT(
  toPrincipal: Principal,
  amount: bigint
): Promise<BridgeResult> {
  const actor = await getNexusActor();
  const result: CanisterResult<bigint, any> = await actor.bridgeMintNXT({
    to: toPrincipal,
    amount,
  });

  if ("Ok" in result) {
    return { ok: true, blockIndex: result.Ok };
  }
  return { ok: false, error: result.Err };
}

// Cache de discord_id -> User. Sólo cacheamos resultados POSITIVOS
// (usuario encontrado): son estables una vez vinculados.
const discordUserCache = new Map<string, { ok: true; user: NexusUser }>();

export async function getDiscordUser(discordId: string): Promise<DiscordUserResult> {
  if (discordUserCache.has(discordId)) {
    return discordUserCache.get(discordId)!;
  }

  const actor = await getNexusActor();
  const result: CanisterResult<NexusUser, any> = await actor.getDiscordUser(discordId);

  if ("Ok" in result) {
    const hit = { ok: true as const, user: result.Ok };
    discordUserCache.set(discordId, hit);
    return hit;
  }
  return { ok: false, error: result.Err };
}

// Subaccount de un usuario, tal como lo calcula el minter internamente (_getUserSubaccount).
export async function getUserSubaccount(principal: Principal): Promise<Uint8Array> {
  const actor = await getNexusActor();
  const bytes: number[] = await actor.getUserSubaccount(principal);
  return Uint8Array.from(bytes);
}