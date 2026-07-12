import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const GET = requireAuth(async () => {
  const trips = await prisma.trip.findMany({
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(trips);
});

export const POST = requireAuth(async (req: Request) => {
  const body = await req.json();
  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = body;

  if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return Response.json({ error: "Vehicle not found" }, { status: 404 });

  if (vehicle.status !== "Available") {
    return Response.json({ error: "Vehicle is not available (Retired, In Shop, or On Trip)" }, { status: 400 });
  }

  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) return Response.json({ error: "Driver not found" }, { status: 404 });

  if (driver.status !== "Available") {
    return Response.json({ error: "Driver is not available (Suspended, On Trip, or Off Duty)" }, { status: 400 });
  }

  if (new Date(driver.licenseExpiry) < new Date()) {
    return Response.json({ error: "Driver license has expired" }, { status: 400 });
  }

  if (parseFloat(cargoWeight) > vehicle.maxLoadCapacity) {
    return Response.json(
      { error: `Cargo weight (${cargoWeight}kg) exceeds vehicle max capacity (${vehicle.maxLoadCapacity}kg)` },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.create({
    data: {
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeight: parseFloat(cargoWeight),
      plannedDistance: parseFloat(plannedDistance),
      status: "Draft",
    },
    include: { vehicle: true, driver: true },
  });

  return Response.json(trip, { status: 201 });
});
