import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const GET = requireRole(["admin", "fleet_manager", "safety_officer"])(async (
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(driver);
});

export const PUT = requireRole(["admin", "fleet_manager"])(async (
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  if (body.licenseNumber && body.licenseNumber !== existing.licenseNumber) {
    const dup = await prisma.driver.findUnique({ where: { licenseNumber: body.licenseNumber } });
    if (dup) return Response.json({ error: "License number already exists" }, { status: 409 });
  }

  const driver = await prisma.driver.update({
    where: { id },
    data: {
      name: body.name || existing.name,
      licenseNumber: body.licenseNumber || existing.licenseNumber,
      licenseCategory: body.licenseCategory || existing.licenseCategory,
      licenseExpiry: body.licenseExpiry ? new Date(body.licenseExpiry) : existing.licenseExpiry,
      contactNumber: body.contactNumber || existing.contactNumber,
      safetyScore: body.safetyScore !== undefined ? parseFloat(body.safetyScore) : existing.safetyScore,
      status: body.status || existing.status,
      region: body.region || existing.region,
    },
  });

  return Response.json(driver);
});

export const DELETE = requireRole(["admin"])(async (
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  await prisma.driver.delete({ where: { id } });
  return Response.json({ success: true });
});
