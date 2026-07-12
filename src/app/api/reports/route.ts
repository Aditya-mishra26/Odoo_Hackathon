import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const GET = requireAuth(async () => {
  const [vehicles, trips, fuelLogs, maintenanceLogs, expenses] = await Promise.all([
    prisma.vehicle.findMany({ where: { status: { not: "Retired" } } }),
    prisma.trip.findMany({ where: { status: "Completed" }, include: { vehicle: true } }),
    prisma.fuelLog.findMany(),
    prisma.maintenanceLog.findMany(),
    prisma.expense.findMany(),
  ]);

  const vehicleStats = vehicles.map((vehicle) => {
    const vehicleTrips = trips.filter((t) => t.vehicleId === vehicle.id);
    const vehicleFuel = fuelLogs.filter((f) => f.vehicleId === vehicle.id);
    const vehicleMaintenance = maintenanceLogs.filter((m) => m.vehicleId === vehicle.id);
    const vehicleExpenses = expenses.filter((e) => e.vehicleId === vehicle.id);

    const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalExpenseCost = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenseCost;

    const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.actualDistance || t.plannedDistance), 0);
    const totalFuelLiters = vehicleFuel.reduce((sum, f) => sum + f.liters, 0);
    const fuelEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;

    const roi =
      vehicle.acquisitionCost > 0
        ? ((vehicle.revenue - totalOperationalCost) / vehicle.acquisitionCost) * 100
        : 0;

    return {
      vehicleId: vehicle.id,
      registrationNo: vehicle.registrationNo,
      name: vehicle.name,
      type: vehicle.type,
      totalTrips: vehicleTrips.length,
      totalDistance,
      totalFuelLiters,
      fuelEfficiency: Math.round(fuelEfficiency * 100) / 100,
      totalFuelCost,
      totalMaintenanceCost,
      totalExpenseCost,
      totalOperationalCost,
      revenue: vehicle.revenue,
      roi: Math.round(roi * 100) / 100,
    };
  });

  const fleetUtilization = {
    byType: [] as { type: string; total: number; onTrip: number; utilization: number }[],
  };

  const types = [...new Set(vehicles.map((v) => v.type))];
  for (const type of types) {
    const typeVehicles = vehicles.filter((v) => v.type === type);
    const onTrip = typeVehicles.filter((v) => v.status === "On Trip").length;
    fleetUtilization.byType.push({
      type,
      total: typeVehicles.length,
      onTrip,
      utilization: typeVehicles.length > 0 ? Math.round((onTrip / typeVehicles.length) * 100) : 0,
    });
  }

  const monthlyExpenses = [] as { month: string; fuel: number; maintenance: number; other: number }[];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toLocaleString("default", { month: "short", year: "2-digit" });
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const mFuel = fuelLogs
      .filter((f) => f.date >= start && f.date <= end)
      .reduce((sum, f) => sum + f.cost, 0);
    const mMaint = maintenanceLogs
      .filter((m) => m.startDate >= start && m.startDate <= end)
      .reduce((sum, m) => sum + m.cost, 0);
    const mOther = expenses
      .filter((e) => e.date >= start && e.date <= end)
      .reduce((sum, e) => sum + e.amount, 0);

    monthlyExpenses.push({ month: monthStr, fuel: mFuel, maintenance: mMaint, other: mOther });
  }

  return Response.json({ vehicleStats, fleetUtilization, monthlyExpenses });
});
