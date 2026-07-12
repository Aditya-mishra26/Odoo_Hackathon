import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPwd = await bcrypt.hash("admin123", 10);
  const fleetPwd = await bcrypt.hash("fleet123", 10);
  const safetyPwd = await bcrypt.hash("safety123", 10);
  const analystPwd = await bcrypt.hash("analyst123", 10);

  await prisma.user.createMany({
    data: [
      { email: "admin@transitops.com", password: adminPwd, name: "Admin User", role: "admin" },
      { email: "fleet@transitops.com", password: fleetPwd, name: "Rajesh Kumar", role: "fleet_manager" },
      { email: "safety@transitops.com", password: safetyPwd, name: "Priya Sharma", role: "safety_officer" },
      { email: "analyst@transitops.com", password: analystPwd, name: "Amit Patel", role: "financial_analyst" },
    ],
  });

  const v1 = await prisma.vehicle.create({ data: { registrationNo: "MH-12-AB-1234", name: "Tata Ace Gold", type: "Van", maxLoadCapacity: 750, odometer: 45000, acquisitionCost: 550000, status: "Available", region: "North", revenue: 150000 } });
  const v2 = await prisma.vehicle.create({ data: { registrationNo: "MH-14-CD-5678", name: "Ashok Leyland Dost", type: "Truck", maxLoadCapacity: 1500, odometer: 62000, acquisitionCost: 750000, status: "On Trip", region: "South", revenue: 250000 } });
  const v3 = await prisma.vehicle.create({ data: { registrationNo: "DL-01-EF-9012", name: "Eicher Pro 2049", type: "Truck", maxLoadCapacity: 2500, odometer: 38000, acquisitionCost: 1650000, status: "Available", region: "East", revenue: 480000 } });
  const v4 = await prisma.vehicle.create({ data: { registrationNo: "KA-05-GH-3456", name: "Force Traveller", type: "Bus", maxLoadCapacity: 1000, odometer: 28000, acquisitionCost: 1450000, status: "Available", region: "West", revenue: 320000 } });
  const v5 = await prisma.vehicle.create({ data: { registrationNo: "TN-07-IJ-7890", name: "BharatBenz 1613", type: "Truck", maxLoadCapacity: 5000, odometer: 71000, acquisitionCost: 3200000, status: "In Shop", region: "North", revenue: 850000 } });
  const v6 = await prisma.vehicle.create({ data: { registrationNo: "GJ-06-KL-2345", name: "Tata Ultra", type: "Tanker", maxLoadCapacity: 8000, odometer: 55000, acquisitionCost: 2800000, status: "Available", region: "South", revenue: 720000 } });
  await prisma.vehicle.create({ data: { registrationNo: "RJ-14-MN-6789", name: "Mahindra Bolero", type: "Van", maxLoadCapacity: 500, odometer: 32000, acquisitionCost: 850000, status: "Retired", region: "East", revenue: 180000 } });
  const v8 = await prisma.vehicle.create({ data: { registrationNo: "UP-32-OP-0123", name: "Tata LPT 1613", type: "Truck", maxLoadCapacity: 3000, odometer: 41000, acquisitionCost: 2400000, status: "On Trip", region: "West", revenue: 580000 } });

  const d1 = await prisma.driver.create({ data: { name: "Gurpreet Singh", licenseNumber: "DL-2021-001", licenseCategory: "LMV-GV", licenseExpiry: new Date("2027-06-15"), contactNumber: "+91-9876543210", safetyScore: 95, status: "Available", region: "North" } });
  const d2 = await prisma.driver.create({ data: { name: "Suresh Reddy", licenseNumber: "MH-2022-045", licenseCategory: "LMV-GV", licenseExpiry: new Date("2028-03-20"), contactNumber: "+91-9876543211", safetyScore: 88, status: "On Trip", region: "South" } });
  const d3 = await prisma.driver.create({ data: { name: "Vikram Singh", licenseNumber: "DL-2020-102", licenseCategory: "HMV", licenseExpiry: new Date("2025-12-01"), contactNumber: "+91-9876543212", safetyScore: 72, status: "Available", region: "East" } });
  await prisma.driver.create({ data: { name: "Meena Devi", licenseNumber: "KA-2023-078", licenseCategory: "TRANS", licenseExpiry: new Date("2029-08-10"), contactNumber: "+91-9876543213", safetyScore: 100, status: "Off Duty", region: "West" } });
  await prisma.driver.create({ data: { name: "Ravi Patel", licenseNumber: "GJ-2019-201", licenseCategory: "HMV", licenseExpiry: new Date("2024-01-15"), contactNumber: "+91-9876543214", safetyScore: 45, status: "Suspended", region: "North" } });
  const d6 = await prisma.driver.create({ data: { name: "Anita Kumari", licenseNumber: "TN-2022-156", licenseCategory: "LMV-GV", licenseExpiry: new Date("2027-11-30"), contactNumber: "+91-9876543215", safetyScore: 91, status: "On Trip", region: "South" } });
  await prisma.driver.create({ data: { name: "Karthik Nair", licenseNumber: "KL-2021-089", licenseCategory: "TRANS", licenseExpiry: new Date("2026-05-20"), contactNumber: "+91-9876543216", safetyScore: 83, status: "Available", region: "West" } });

  await prisma.trip.create({ data: { source: "Mumbai", destination: "Pune", vehicleId: v2.id, driverId: d2.id, cargoWeight: 1200, plannedDistance: 150, actualDistance: 148, fuelConsumed: 42, status: "Completed", tripRevenue: 12500, finalOdometer: 62148 } });
  await prisma.trip.create({ data: { source: "Delhi", destination: "Jaipur", vehicleId: v8.id, driverId: d6.id, cargoWeight: 2500, plannedDistance: 280, status: "Dispatched" } });
  await prisma.trip.create({ data: { source: "Chennai", destination: "Bangalore", vehicleId: v1.id, driverId: d1.id, cargoWeight: 500, plannedDistance: 350, status: "Draft" } });
  await prisma.trip.create({ data: { source: "Kolkata", destination: "Patna", vehicleId: v3.id, driverId: d3.id, cargoWeight: 2000, plannedDistance: 600, actualDistance: 595, fuelConsumed: 98, status: "Completed", tripRevenue: 45000, finalOdometer: 38595 } });

  await prisma.maintenanceLog.createMany({ data: [
    { vehicleId: v5.id, type: "Engine Repair", description: "Major engine overhaul after 70k km", cost: 85000, status: "Active" },
    { vehicleId: v1.id, type: "Oil Change", description: "Regular 10k km oil change", cost: 3200, status: "Completed", endDate: new Date("2026-06-01") },
    { vehicleId: v3.id, type: "Brake Service", description: "Front brake pad replacement", cost: 9500, status: "Completed", endDate: new Date("2026-05-15") },
    { vehicleId: v6.id, type: "Tire Rotation", description: "All-season tire rotation", cost: 4800, status: "Completed", endDate: new Date("2026-06-20") },
  ]});

  await prisma.fuelLog.createMany({ data: [
    { vehicleId: v2.id, liters: 42, cost: 4200, date: new Date("2026-06-10") },
    { vehicleId: v2.id, liters: 38, cost: 3800, date: new Date("2026-06-25") },
    { vehicleId: v3.id, liters: 98, cost: 9800, date: new Date("2026-06-15") },
    { vehicleId: v3.id, liters: 85, cost: 8500, date: new Date("2026-07-01") },
    { vehicleId: v1.id, liters: 25, cost: 2500, date: new Date("2026-06-20") },
    { vehicleId: v4.id, liters: 30, cost: 3000, date: new Date("2026-07-05") },
    { vehicleId: v6.id, liters: 65, cost: 6500, date: new Date("2026-06-28") },
    { vehicleId: v8.id, liters: 72, cost: 7200, date: new Date("2026-07-02") },
  ]});

  await prisma.expense.createMany({ data: [
    { vehicleId: v2.id, type: "Tolls", description: "Mumbai-Pune expressway toll", amount: 650, date: new Date("2026-06-10") },
    { vehicleId: v2.id, type: "Insurance", description: "Annual insurance premium", amount: 28000, date: new Date("2026-01-15") },
    { vehicleId: v3.id, type: "Tolls", description: "Delhi-Jaipur highway toll", amount: 850, date: new Date("2026-06-15") },
    { vehicleId: v1.id, type: "Other", description: "Parking fees", amount: 450, date: new Date("2026-06-20") },
    { vehicleId: v6.id, type: "Tolls", description: "Chennai-Bangalore toll", amount: 1100, date: new Date("2026-06-28") },
    { vehicleId: v4.id, type: "Insurance", description: "Quarterly insurance", amount: 18000, date: new Date("2026-04-01") },
  ]});

  console.log("Database seeded successfully!");
  console.log("  Admin: admin@transitops.com / admin123");
  console.log("  Fleet Manager: fleet@transitops.com / fleet123");
  console.log("  Safety Officer: safety@transitops.com / safety123");
  console.log("  Analyst: analyst@transitops.com / analyst123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
