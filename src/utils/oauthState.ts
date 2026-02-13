import crypto from "crypto";
import config from "../config/index.js";

interface OAuthState {
  role?: string;
  timestamp: number;
  nonce: string;
}

/**
 * Get encryption key from secret (32 bytes for AES-256)
 */
const getEncryptionKey = (): Buffer => {
  const secret = config.oauth.stateSecret;

  // If secret is 64 hex characters (32 bytes), use it directly
  if (secret.length === 64 && /^[0-9a-f]+$/i.test(secret)) {
    return Buffer.from(secret, "hex");
  }

  // Otherwise, create a hash to get consistent 32 bytes
  return crypto.createHash("sha256").update(secret).digest();
};

/**
 * Encrypt and encode OAuth state for CSRF protection
 */
export const encryptState = (role?: string): string => {
  const state: OAuthState = {
    role,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex"),
  };

  const stateString = JSON.stringify(state);
  const key = getEncryptionKey();
  const iv = Buffer.alloc(16, 0); // Fixed IV for simplicity (state is time-limited anyway)

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(stateString, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Convert hex string to Buffer, then to base64url
  return Buffer.from(encrypted, "hex").toString("base64url");
};

/**
 * Decrypt and validate OAuth state
 */
export const decryptState = (encryptedState: string): OAuthState | null => {
  try {
    const encrypted = Buffer.from(encryptedState, "base64url").toString("hex");
    const key = getEncryptionKey();
    const iv = Buffer.alloc(16, 0); // Must match the IV used in encryption

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const state: OAuthState = JSON.parse(decrypted);

    // Validate timestamp (state valid for 10 minutes)
    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - state.timestamp > tenMinutes) {
      console.warn("OAuth state expired");
      return null;
    }

    return state;
  } catch (error) {
    console.error("Failed to decrypt OAuth state:", error);
    return null;
  }
};
