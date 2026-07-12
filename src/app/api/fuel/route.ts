import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const GET = requireAuth(async () => {
  const logs = await prisma.fuelLog.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(logs);
});

export const POST = requireAuth(async (req: Request) => {
  const body = await req.json();
  const { vehicleId, liters, cost, date, tripId } = body;

  if (!vehicleId || !liters || !cost) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const log = await prisma.fuelLog.create({
    data: {
      vehicleId,
      tripId: tripId || null,
      liters: parseFloat(liters),
      cost: parseFloat(cost),
      date: date ? new Date(date) : new Date(),
    },
    include: { vehicle: true },
  });

  return Response.json(log, { status: 201 });
});

export const DELETE = requireAuth(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await prisma.fuelLog.delete({ where: { id } });
  return Response.json({ success: true });
});
