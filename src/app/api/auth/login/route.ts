import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const bcrypt = await import("bcryptjs");
  const valid = await bcrypt.default.compare(password, user.password);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
