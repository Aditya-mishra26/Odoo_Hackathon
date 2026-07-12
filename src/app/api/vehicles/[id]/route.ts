import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const GET = requireRole(["admin", "fleet_manager"])(async (
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(vehicle);
});

export const PUT = requireRole(["admin", "fleet_manager"])(async (
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  if (body.registrationNo && body.registrationNo !== existing.registrationNo) {
    const dup = await prisma.vehicle.findUnique({ where: { registrationNo: body.registrationNo } });
    if (dup) return Response.json({ error: "Registration number already exists" }, { status: 409 });
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      registrationNo: body.registrationNo || existing.registrationNo,
      name: body.name || existing.name,
      type: body.type || existing.type,
      maxLoadCapacity: body.maxLoadCapacity ? parseFloat(body.maxLoadCapacity) : existing.maxLoadCapacity,
      odometer: body.odometer !== undefined ? parseFloat(body.odometer) : existing.odometer,
      acquisitionCost: body.acquisitionCost ? parseFloat(body.acquisitionCost) : existing.acquisitionCost,
      status: body.status || existing.status,
      region: body.region || existing.region,
    },
  });

  return Response.json(vehicle);
});

export const DELETE = requireRole(["admin"])(async (
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  await prisma.vehicle.delete({ where: { id } });
  return Response.json({ success: true });
});
