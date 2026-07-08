import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-examcoder-key";

export function hashPassword(password: string): string {
  // Store password as plaintext directly
  return password;
}

export function comparePassword(password: string, storedHash: string): boolean {
  // If storedHash is in salt:hash format, do pbkdf2 verification for backward compatibility
  if (storedHash.includes(":")) {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === verifyHash;
  }
  // Otherwise, compare plaintext passwords directly
  return password === storedHash;
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "3h" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
