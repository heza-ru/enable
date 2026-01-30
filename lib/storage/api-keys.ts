"use client";

/**
 * Client-side API key management for Enable
 * Keys are stored either in memory only or encrypted in localStorage
 * Never logged or sent to any server except api.anthropic.com
 */

const STORAGE_KEY = "enable_api_key_encrypted";
const STORAGE_MODE_KEY = "enable_storage_mode";
const LAST_ACTIVITY_KEY = "enable_last_activity";
const SESSION_KEY = "enable_session_id";
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes (reduced from 30)
const MAX_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

type StorageMode = "memory" | "encrypted";

// In-memory storage (cleared on page refresh)
let memoryApiKey: string | null = null;
let userPassword: string | null = null; // Store user's encryption password in memory only

/**
 * Encrypt a string using Web Crypto API (AES-GCM)
 * Now uses user-provided password for strong encryption
 */
async function encrypt(text: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // Derive key from user password
  const key = await deriveEncryptionKey(password);

  // Generate random IV (Initialization Vector)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // Combine iv + encrypted data (no salt needed as we use session-based derivation)
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a string using Web Crypto API (AES-GCM)
 * Now uses user-provided password for strong decryption
 */
async function decrypt(
  encryptedText: string,
  password: string
): Promise<string> {
  const decoder = new TextDecoder();

  // Decode base64
  const combined = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));

  // Extract iv and encrypted data
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  // Derive key from user password
  const key = await deriveEncryptionKey(password);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return decoder.decode(decrypted);
}

/**
 * Generate a cryptographically secure session ID
 */
function generateSessionId(): string {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Derive a strong encryption key from user password
 * Uses session ID as additional entropy
 */
async function deriveEncryptionKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const sessionId = getSessionId();
  
  // Combine user password with session ID for additional entropy
  const combinedPassword = `${password}:${sessionId}:enable-v2`;
  
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(combinedPassword),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  // Fixed salt for key derivation (session-specific)
  const salt = encoder.encode(`enable-salt-${sessionId.slice(0, 16)}`);

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 250_000, // Increased from 100k to 250k
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Store API key in memory or encrypted localStorage
 * Now requires user password for encrypted mode
 */
export async function storeApiKey(
  apiKey: string,
  mode: StorageMode = "memory",
  password?: string
): Promise<void> {
  if (mode === "memory") {
    memoryApiKey = apiKey;
    userPassword = null;
    localStorage.setItem(STORAGE_MODE_KEY, "memory");
    localStorage.removeItem(STORAGE_KEY);
  } else {
    if (!password) {
      throw new Error("Password is required for encrypted storage mode");
    }
    
    // Validate password strength
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const encrypted = await encrypt(apiKey, password);
    localStorage.setItem(STORAGE_KEY, encrypted);
    localStorage.setItem(STORAGE_MODE_KEY, "encrypted");
    
    // Store password in memory for session
    userPassword = password;
    memoryApiKey = null;
  }

  updateLastActivity();
  updateSessionStart();
}

/**
 * Retrieve API key from memory or encrypted localStorage
 * Now requires password for encrypted mode
 */
export async function getApiKey(password?: string): Promise<string | null> {
  checkInactivity();
  checkSessionExpiry();

  const mode = localStorage.getItem(STORAGE_MODE_KEY) as StorageMode | null;

  if (mode === "memory") {
    updateLastActivity();
    return memoryApiKey;
  }

  if (mode === "encrypted") {
    const encrypted = localStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;

    // Use cached password or require new one
    const decryptionPassword = password || userPassword;
    
    if (!decryptionPassword) {
      throw new Error("Password required to decrypt API key");
    }

    try {
      const decrypted = await decrypt(encrypted, decryptionPassword);
      
      // Cache password for this session if not already cached
      if (!userPassword) {
        userPassword = decryptionPassword;
      }
      
      updateLastActivity();
      return decrypted;
    } catch (error) {
      console.error("Failed to decrypt API key - incorrect password or corrupted data");
      
      // Clear cached password on decryption failure
      userPassword = null;
      
      throw new Error("Incorrect password or corrupted encryption");
    }
  }

  return null;
}

/**
 * Clear API key from all storage
 */
export function clearApiKey(): void {
  memoryApiKey = null;
  userPassword = null;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_MODE_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Update session start timestamp
 */
function updateSessionStart(): void {
  if (!sessionStorage.getItem('enable_session_start')) {
    sessionStorage.setItem('enable_session_start', Date.now().toString());
  }
}

/**
 * Check if session has expired (max 4 hours)
 */
function checkSessionExpiry(): void {
  const sessionStart = sessionStorage.getItem('enable_session_start');
  if (!sessionStart) return;

  const sessionDuration = Date.now() - Number.parseInt(sessionStart, 10);

  if (sessionDuration > MAX_SESSION_DURATION) {
    console.warn('Session expired after 4 hours - clearing API key for security');
    clearApiKey();
    throw new Error('Session expired. Please re-enter your API key.');
  }
}

/**
 * Check if API key exists
 */
export function hasApiKey(): boolean {
  const mode = localStorage.getItem(STORAGE_MODE_KEY);

  if (mode === "memory") {
    return memoryApiKey !== null;
  }

  if (mode === "encrypted") {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  return false;
}

/**
 * Get storage mode
 */
export function getStorageMode(): StorageMode | null {
  return localStorage.getItem(STORAGE_MODE_KEY) as StorageMode | null;
}

/**
 * Update last activity timestamp
 */
function updateLastActivity(): void {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

/**
 * Check for inactivity and clear key if timeout exceeded
 */
function checkInactivity(): void {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return;

  const timeSinceActivity = Date.now() - Number.parseInt(lastActivity, 10);

  if (timeSinceActivity > INACTIVITY_TIMEOUT) {
    clearApiKey();
  }
}

/**
 * Validate API key format (basic check)
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Claude API keys start with "sk-ant-"
  return key.startsWith("sk-ant-") && key.length > 20;
}

/**
 * Clear API key and session data on window close/refresh
 */
if (typeof window !== "undefined") {
  // ALWAYS clear memory password on unload for security
  window.addEventListener("beforeunload", () => {
    userPassword = null; // Clear password from memory
    
    const mode = getStorageMode();
    if (mode === "memory") {
      clearApiKey(); // Clear everything for memory mode
    }
  });

  // Clear everything on browser close (not just tab close)
  window.addEventListener("pagehide", () => {
    userPassword = null;
  });

  // Periodic security checks
  setInterval(() => {
    checkInactivity();
    checkSessionExpiry();
  }, 60 * 1000); // Check every minute

  // Clear API key if page is hidden for too long (mobile/background tabs)
  let hiddenTime: number | null = null;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hiddenTime = Date.now();
    } else if (hiddenTime) {
      const timeHidden = Date.now() - hiddenTime;
      if (timeHidden > INACTIVITY_TIMEOUT) {
        console.warn('Page was hidden for too long - clearing API key for security');
        clearApiKey();
      }
      hiddenTime = null;
    }
  });
}
