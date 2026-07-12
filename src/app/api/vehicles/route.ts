import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const GET = requireRole(["admin", "fleet_manager", "financial_analyst", "safety_officer"])(async () => {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(vehicles);
});

export const POST = requireRole(["admin", "fleet_manager"])(async (req: Request) => {
  const body = await req.json();
  const { registrationNo, name, type, maxLoadCapacity, odometer, acquisitionCost, region } = body;

  if (!registrationNo || !name || !type || !maxLoadCapacity || !acquisitionCost) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.vehicle.findUnique({ where: { registrationNo } });
  if (existing) {
    return Response.json({ error: "Registration number already exists" }, { status: 409 });
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNo,
      name,
      type,
      maxLoadCapacity: parseFloat(maxLoadCapacity),
      odometer: odometer ? parseFloat(odometer) : 0,
      acquisitionCost: parseFloat(acquisitionCost),
      region: region || "General",
    },
  });

  return Response.json(vehicle, { status: 201 });
});
