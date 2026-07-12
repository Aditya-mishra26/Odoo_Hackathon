"use client";

import Sidebar from "@/components/Sidebar";
import { DataTable, Button, Input, Select } from "@/components/ui";
import Modal from "@/components/Modal";
import { useEffect, useState } from "react";
import { Plus, Trash2, Fuel, Receipt } from "lucide-react";

interface FuelLog { id: string; vehicleId: string; liters: number; cost: number; date: string; vehicle: { registrationNo: string } }
interface Expense { id: string; vehicleId: string; type: string; description: string; amount: number; date: string; vehicle: { registrationNo: string } }
interface Vehicle { id: string; registrationNo: string; name: string }

const expenseTypes = ["Fuel", "Tolls", "Maintenance", "Insurance", "Other"];

export default function FuelExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelModal, setFuelModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [fuelForm, setFuelForm] = useState({ vehicleId: "", liters: "", cost: "", date: "" });
  const [expenseForm, setExpenseForm] = useState({ vehicleId: "", type: "Tolls", description: "", amount: "", date: "" });
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"fuel" | "expenses">("fuel");

  const fetchAll = () => {
    fetch("/api/fuel").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setFuelLogs(d); });
    fetch("/api/expenses").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setExpenses(d); });
    fetch("/api/vehicles").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setVehicles(d); });
  };

  useEffect(() => { fetchAll(); }, []);

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/fuel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fuelForm) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setFuelModal(false); fetchAll();
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(expenseForm) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setExpenseModal(false); fetchAll();
  };

  const handleDeleteFuel = async (id: string) => {
    await fetch(`/api/fuel?id=${id}`, { method: "DELETE" }); fetchAll();
  };

  const handleDeleteExpense = async (id: string) => {
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" }); fetchAll();
  };

  const fuelColumns = [
    { key: "vehicle", label: "Vehicle", render: (_: unknown, row: Record<string, unknown>) => (row.vehicle as FuelLog["vehicle"])?.registrationNo },
    { key: "liters", label: "Liters" },
    { key: "cost", label: "Cost", render: (v: unknown) => `Rs. ${Number(v).toLocaleString("en-IN")}` },
    { key: "date", label: "Date", render: (v: unknown) => new Date(String(v)).toLocaleDateString() },
    {
      key: "actions", label: "", render: (_: unknown, row: Record<string, unknown>) => (
        <button onClick={(e) => { e.stopPropagation(); handleDeleteFuel((row as unknown as FuelLog).id); }}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
      ),
    },
  ];

  const expenseColumns = [
    { key: "vehicle", label: "Vehicle", render: (_: unknown, row: Record<string, unknown>) => (row.vehicle as Expense["vehicle"])?.registrationNo },
    { key: "type", label: "Type" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount", render: (v: unknown) => `Rs. ${Number(v).toLocaleString("en-IN")}` },
    { key: "date", label: "Date", render: (v: unknown) => new Date(String(v)).toLocaleDateString() },
    {
      key: "actions", label: "", render: (_: unknown, row: Record<string, unknown>) => (
        <button onClick={(e) => { e.stopPropagation(); handleDeleteExpense((row as unknown as Expense).id); }}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
      ),
    },
  ];

  const totalFuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalExpenseCost = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <Sidebar>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fuel & Expenses</h1>
          <p className="text-slate-500 text-sm">Track fuel consumption and operational expenses</p>
        </div>
        <Button onClick={() => {
          if (tab === "fuel") { setFuelForm({ vehicleId: "", liters: "", cost: "", date: "" }); setFuelModal(true); }
          else { setExpenseForm({ vehicleId: "", type: "Tolls", description: "", amount: "", date: "" }); setExpenseModal(true); }
        }}>
          <Plus className="w-4 h-4 mr-1 inline" /> Add {tab === "fuel" ? "Fuel Log" : "Expense"}
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setTab("fuel")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "fuel" ? "bg-brand-medium text-white" : "bg-white border border-brand-light text-slate-600 hover:bg-brand-cream/50"}`}>
          <Fuel className="w-4 h-4 mr-1 inline" /> Fuel Logs
        </button>
        <button onClick={() => setTab("expenses")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "expenses" ? "bg-brand-medium text-white" : "bg-white border border-brand-light text-slate-600 hover:bg-brand-cream/50"}`}>
          <Receipt className="w-4 h-4 mr-1 inline" /> Expenses
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-brand-light/40 p-4">
          <div className="text-sm text-slate-500">Total Fuel Cost</div>
          <div className="text-2xl font-bold text-brand-medium">Rs. {totalFuelCost.toLocaleString("en-IN")}</div>
        </div>
        <div className="bg-white rounded-xl border border-brand-light/40 p-4">
          <div className="text-sm text-slate-500">Total Expenses</div>
          <div className="text-2xl font-bold text-orange-600">Rs. {totalExpenseCost.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {tab === "fuel" ? (
        <DataTable columns={fuelColumns} data={fuelLogs as unknown as Record<string, unknown>[]} />
      ) : (
        <DataTable columns={expenseColumns} data={expenses as unknown as Record<string, unknown>[]} />
      )}

      <Modal open={fuelModal} onClose={() => setFuelModal(false)} title="Add Fuel Log">
        <form onSubmit={handleFuelSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <Select label="Vehicle" name="vehicleId" value={fuelForm.vehicleId}
            onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
            options={vehicles.map((v) => ({ value: v.id, label: `${v.registrationNo} - ${v.name}` }))} required />
          <Input label="Liters" name="liters" type="number" value={fuelForm.liters}
            onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} required />
          <Input label="Cost (Rs.)" name="cost" type="number" value={fuelForm.cost}
            onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} required />
          <Input label="Date" name="date" type="date" value={fuelForm.date}
            onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setFuelModal(false)}>Cancel</Button>
            <Button type="submit">Add Log</Button>
          </div>
        </form>
      </Modal>

      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="Add Expense">
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <Select label="Vehicle" name="vehicleId" value={expenseForm.vehicleId}
            onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}
            options={vehicles.map((v) => ({ value: v.id, label: `${v.registrationNo} - ${v.name}` }))} required />
          <Select label="Expense Type" name="type" value={expenseForm.type}
            onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
            options={expenseTypes.map((t) => ({ value: t, label: t }))} required />
          <Input label="Description" name="description" value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
          <Input label="Amount (Rs.)" name="amount" type="number" value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
          <Input label="Date" name="date" type="date" value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setExpenseModal(false)}>Cancel</Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </Modal>
    </Sidebar>
  );
}
