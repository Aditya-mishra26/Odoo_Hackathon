import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const GET = requireAuth(async (
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });
  if (!trip) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(trip);
});

export const PUT = requireAuth(async (
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  const body = await req.json();

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return Response.json({ error: "Not found" }, { status: 404 });

  if (body.status === "Dispatched" && trip.status === "Draft") {
    await prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "On Trip" } });
    await prisma.driver.update({ where: { id: trip.driverId }, data: { status: "On Trip" } });
  }

  if (body.status === "Completed" && trip.status === "Dispatched") {
    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        status: "Available",
        odometer: body.finalOdometer ? parseFloat(body.finalOdometer) : undefined,
        revenue: { increment: body.tripRevenue ? parseFloat(body.tripRevenue) : 0 },
      },
    });
    await prisma.driver.update({ where: { id: trip.driverId }, data: { status: "Available" } });
  }

  if (body.status === "Cancelled" && trip.status === "Dispatched") {
    await prisma.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "Available" } });
    await prisma.driver.update({ where: { id: trip.driverId }, data: { status: "Available" } });
  }

  const updated = await prisma.trip.update({
    where: { id },
    data: {
      source: body.source || trip.source,
      destination: body.destination || trip.destination,
      cargoWeight: body.cargoWeight ? parseFloat(body.cargoWeight) : trip.cargoWeight,
      plannedDistance: body.plannedDistance ? parseFloat(body.plannedDistance) : trip.plannedDistance,
      actualDistance: body.actualDistance !== undefined ? parseFloat(body.actualDistance) : trip.actualDistance,
      fuelConsumed: body.fuelConsumed !== undefined ? parseFloat(body.fuelConsumed) : trip.fuelConsumed,
      tripRevenue: body.tripRevenue !== undefined ? parseFloat(body.tripRevenue) : trip.tripRevenue,
      finalOdometer: body.finalOdometer !== undefined ? parseFloat(body.finalOdometer) : trip.finalOdometer,
      status: body.status || trip.status,
    },
    include: { vehicle: true, driver: true },
  });

  return Response.json(updated);
});

export const DELETE = requireAuth(async (
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) => {
  const { id } = await ctx.params;
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) return Response.json({ error: "Not found" }, { status: 404 });

  if (trip.status === "Dispatched") {
    return Response.json({ error: "Cannot delete a dispatched trip. Cancel it first." }, { status: 400 });
  }

  await prisma.trip.delete({ where: { id } });
  return Response.json({ success: true });
});
