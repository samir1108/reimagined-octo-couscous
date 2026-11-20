// ============================================================
// Simple AES-GCM encryption utility for sensitive data
// Uses Web Crypto API (built into Deno)
// ============================================================

const ALGO = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

let _cachedKey: CryptoKey | null = null;

function getKey(): CryptoKey {
  if (_cachedKey) return _cachedKey;

  const raw = Deno.env.get("ENCRYPTION_KEY");
  if (!raw) {
    throw new Error("ENCRYPTION_KEY env var is not set");
  }

  const keyMaterial = raw.startsWith("base64:")
    ? base64ToBytes(raw.slice(7))
    : new TextEncoder().encode(raw);

  if (keyMaterial.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must be 32 bytes (got ${keyMaterial.length})`);
  }

  _cachedKey = new CryptoKey(
    { raw: keyMaterial },
    { name: ALGO },
    false,
    ["encrypt", "decrypt"],
  );
  return _cachedKey;
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export async function encrypt(plaintext: string): Promise<string> {
  if (!plaintext) return plaintext;
  try {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoded = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGO, iv, tagLength: TAG_LENGTH },
      getKey(),
      encoded,
    );
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return `enc:${bytesToBase64(combined)}`;
  } catch (e) {
    console.error("[crypto] encrypt failed:", e);
    return plaintext;
  }
}

export async function decrypt(ciphertext: string): Promise<string> {
  if (!ciphertext || !ciphertext.startsWith("enc:")) return ciphertext;
  try {
    const combined = base64ToBytes(ciphertext.slice(4));
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGO, iv, tagLength: TAG_LENGTH },
      getKey(),
      data,
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("[crypto] decrypt failed:", e);
    return ciphertext;
  }
}

export function isEncrypted(value: string): boolean {
  return value.startsWith("enc:");
}
