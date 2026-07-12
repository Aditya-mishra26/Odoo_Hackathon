import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const GET = requireAuth(async () => {
  const expenses = await prisma.expense.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(expenses);
});

export const POST = requireAuth(async (req: Request) => {
  const body = await req.json();
  const { vehicleId, type, description, amount, date } = body;

  if (!vehicleId || !type || !description || !amount) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      vehicleId,
      type,
      description,
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
    },
    include: { vehicle: true },
  });

  return Response.json(expense, { status: 201 });
});

export const DELETE = requireAuth(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await prisma.expense.delete({ where: { id } });
  return Response.json({ success: true });
});
