import { Ed25519KeyIdentity } from "@icp-sdk/core/identity";

let cachedIdentity: Ed25519KeyIdentity | null = null;

export function getIdentity(): Ed25519KeyIdentity {
  if (cachedIdentity) return cachedIdentity;

  const identityJsonRaw = process.env.NEXUS_IDENTITY_JSON;

  if (!identityJsonRaw) {
    throw new Error(
      "Falta la variable de entorno NEXUS_IDENTITY_JSON con el par de claves en formato JSON."
    );
  }

  try {
    const parsedJson = JSON.parse(identityJsonRaw);
    
    // Si viene como stringified JSON válido, instanciamos la identidad directamente
    cachedIdentity = Ed25519KeyIdentity.fromParsedJson(parsedJson);
  } catch (err: any) {
    throw new Error(`Error parseando NEXUS_IDENTITY_JSON: ${err.message}`);
  }

  return cachedIdentity;
}

export function getPrincipalText(): string {
  return getIdentity().getPrincipal().toText();
}