import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "transitops-secret-key-2026";

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(handler: (...args: any[]) => any) {
  return async (req: Request, ctx?: unknown) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }
    return handler(req, ctx, user);
  };
}

export function requireRole(roles: string[]) {
  return (handler: (...args: any[]) => any) => {
    return async (req: Request, ctx?: unknown) => {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (!token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      const user = verifyToken(token);
      if (!user) {
        return Response.json({ error: "Invalid token" }, { status: 401 });
      }
      if (!roles.includes(user.role)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      return handler(req, ctx, user);
    };
  };
}
