import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const PUT = requireAuth(async (
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  const body = await req.json();

  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) return Response.json({ error: "Not found" }, { status: 404 });

  if (body.status === "Completed" && log.status === "Active") {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: log.vehicleId } });
    if (vehicle && vehicle.status !== "Retired") {
      await prisma.vehicle.update({ where: { id: log.vehicleId }, data: { status: "Available" } });
    }
  }

  const updated = await prisma.maintenanceLog.update({
    where: { id },
    data: {
      status: body.status || log.status,
      endDate: body.status === "Completed" ? new Date() : log.endDate,
      cost: body.cost ? parseFloat(body.cost) : log.cost,
    },
    include: { vehicle: true },
  });

  return Response.json(updated);
});

export const DELETE = requireAuth(async (
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  await prisma.maintenanceLog.delete({ where: { id } });
  return Response.json({ success: true });
});
