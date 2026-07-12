import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const GET = requireAuth(async (req: Request) => {
  const url = new URL(req.url);
  const vehicleType = url.searchParams.get("vehicleType");
  const status = url.searchParams.get("status");
  const region = url.searchParams.get("region");

  const vehicleWhere: Record<string, unknown> = {};
  if (vehicleType) vehicleWhere.type = vehicleType;
  if (status) vehicleWhere.status = status;
  if (region) vehicleWhere.region = region;

  const [vehicles, drivers, trips] = await Promise.all([
    prisma.vehicle.findMany({ where: Object.keys(vehicleWhere).length ? vehicleWhere : undefined }),
    prisma.driver.findMany(),
    prisma.trip.findMany({ include: { vehicle: true, driver: true } }),
  ]);

  const activeVehicles = vehicles.filter((v) => v.status !== "Retired");
  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const inMaintenance = vehicles.filter((v) => v.status === "In Shop");
  const activeTrips = trips.filter((t) => t.status === "Dispatched");
  const pendingTrips = trips.filter((t) => t.status === "Draft");
  const driversOnDuty = drivers.filter((d) => d.status === "On Trip");
  const totalFleet = activeVehicles.length;
  const utilizedFleet = activeVehicles.filter((v) => v.status === "On Trip").length;
  const fleetUtilization = totalFleet > 0 ? Math.round((utilizedFleet / totalFleet) * 100) : 0;

  return Response.json({
    activeVehicles: activeVehicles.length,
    availableVehicles: availableVehicles.length,
    vehiclesInMaintenance: inMaintenance.length,
    activeTrips: activeTrips.length,
    pendingTrips: pendingTrips.length,
    driversOnDuty: driversOnDuty.length,
    fleetUtilization,
    activeTripsList: activeTrips.map((t) => ({
      id: t.id,
      source: t.source,
      destination: t.destination,
      cargoWeight: t.cargoWeight,
      plannedDistance: t.plannedDistance,
      vehicle: { name: t.vehicle.name, registrationNo: t.vehicle.registrationNo },
      driver: { name: t.driver.name },
    })),
  });
});
