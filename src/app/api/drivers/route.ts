import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export const GET = requireRole(["admin", "fleet_manager", "financial_analyst", "safety_officer"])(async () => {
  const drivers = await prisma.driver.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json(drivers);
});

export const POST = requireRole(["admin", "fleet_manager"])(async (req: Request) => {
  const body = await req.json();
  const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, region } = body;

  if (!name || !licenseNumber || !licenseCategory || !licenseExpiry || !contactNumber) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.driver.findUnique({ where: { licenseNumber } });
  if (existing) {
    return Response.json({ error: "License number already exists" }, { status: 409 });
  }

  const driver = await prisma.driver.create({
    data: {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry: new Date(licenseExpiry),
      contactNumber,
      safetyScore: safetyScore ? parseFloat(safetyScore) : 100,
      region: region || "General",
    },
  });

  return Response.json(driver, { status: 201 });
});
