/**
 * Authorization for /api/admin/* requests. The browser console signs in with
 * Supabase Auth and sends its access token as `Authorization: Bearer <jwt>`;
 * this verifies the token and checks the user's email against the ADMIN_EMAILS
 * allowlist. This is the real security boundary — the client-side gate is UX.
 */
import type { VercelRequest } from "@vercel/node";
import { adminDb } from "./supabaseAdmin.js";

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Resolve and authorize the caller, or throw AuthError (401/403). */
export async function requireAdmin(req: VercelRequest): Promise<{ email: string }> {
  const header = (req.headers.authorization as string | undefined) ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new AuthError(401, "Missing bearer token");

  const { data, error } = await adminDb.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) throw new AuthError(401, "Invalid or expired session");

  const list = allowlist();
  if (list.length === 0) throw new AuthError(403, "Admin allowlist (ADMIN_EMAILS) is not configured");
  if (!list.includes(email)) throw new AuthError(403, "Not authorized for the admin console");

  return { email };
}
