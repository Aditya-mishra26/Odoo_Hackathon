import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const GET = requireAuth(async () => {
  const logs = await prisma.maintenanceLog.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(logs);
});

export const POST = requireAuth(async (req: Request) => {
  const body = await req.json();
  const { vehicleId, type, description, cost } = body;

  if (!vehicleId || !type || !description || !cost) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return Response.json({ error: "Vehicle not found" }, { status: 404 });

  const [log] = await prisma.$transaction([
    prisma.maintenanceLog.create({
      data: {
        vehicleId,
        type,
        description,
        cost: parseFloat(cost),
        status: "Active",
      },
      include: { vehicle: true },
    }),
    prisma.vehicle.update({ where: { id: vehicleId }, data: { status: "In Shop" } }),
  ]);

  return Response.json(log, { status: 201 });
});
