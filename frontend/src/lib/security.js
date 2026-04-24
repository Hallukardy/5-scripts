export class SecurityService {
  static async #getSecretKey() {
    let salt = typeof window !== 'undefined' ? localStorage.getItem('5scripts_secure_salt') : null;
    if (!salt && typeof window !== 'undefined') {
      salt = crypto.randomUUID();
      localStorage.setItem('5scripts_secure_salt', salt);
    }
    
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(salt || "fallback-salt"),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("5scripts-master-salt"),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  static async encrypt(text) {
    if (!text) return null;
    try {
      const key = await this.#getSecretKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(text)
      );

      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);
      
      return btoa(String.fromCharCode(...result));
    } catch (e) {
      console.error("Encryption failed", e);
      return null;
    }
  }

  static async decrypt(data) {
    if (!data) return null;
    try {
      const binary = Uint8Array.from(atob(data), c => c.charCodeAt(0));
      const iv = binary.slice(0, 12);
      const content = binary.slice(12);
      const key = await this.#getSecretKey();
      
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        content
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      console.error("Decryption failed", e);
      return null;
    }
  }
}
