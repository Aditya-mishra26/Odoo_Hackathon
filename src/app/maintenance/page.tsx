"use client";

import Sidebar from "@/components/Sidebar";
import { DataTable, StatusBadge, Button, Input, Select } from "@/components/ui";
import Modal from "@/components/Modal";
import { useEffect, useState } from "react";
import { Plus, CheckCircle, Trash2 } from "lucide-react";

interface MaintenanceLog {
  id: string; vehicleId: string; type: string; description: string; cost: number;
  startDate: string; endDate: string | null; status: string;
  vehicle: { registrationNo: string; name: string };
}
interface Vehicle { id: string; registrationNo: string; name: string; status: string; }

const types = ["Oil Change", "Tire Rotation", "Engine Repair", "Brake Service", "General"];

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: "", type: "Oil Change", description: "", cost: "" });
  const [error, setError] = useState("");

  const fetchAll = () => {
    fetch("/api/maintenance").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setLogs(d); });
    fetch("/api/vehicles").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setVehicles(d); });
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const res = await fetch("/api/maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setModalOpen(false); fetchAll();
  };

  const handleComplete = async (log: MaintenanceLog) => {
    await fetch(`/api/maintenance/${log.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Completed" }) });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const columns = [
    { key: "vehicle", label: "Vehicle", render: (_: unknown, row: Record<string, unknown>) => (row.vehicle as MaintenanceLog["vehicle"])?.registrationNo },
    { key: "type", label: "Type" },
    { key: "description", label: "Description" },
    { key: "cost", label: "Cost", render: (v: unknown) => `Rs. ${Number(v).toLocaleString("en-IN")}` },
    { key: "startDate", label: "Start Date", render: (v: unknown) => new Date(String(v)).toLocaleDateString() },
    { key: "endDate", label: "End Date", render: (v: unknown) => v ? new Date(String(v)).toLocaleDateString() : "-" },
    { key: "status", label: "Status", render: (v: unknown) => <StatusBadge status={String(v)} /> },
    {
      key: "actions", label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const log = row as unknown as MaintenanceLog;
        return (
          <div className="flex gap-1">
            {log.status === "Active" && (
              <button onClick={(e) => { e.stopPropagation(); handleComplete(log); }}
                className="p-1.5 text-brand-medium hover:bg-brand-cream rounded" title="Complete">
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <Sidebar>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Maintenance</h1>
          <p className="text-slate-500 text-sm">Track vehicle maintenance and service logs</p>
        </div>
        <Button onClick={() => { setForm({ vehicleId: "", type: "Oil Change", description: "", cost: "" }); setError(""); setModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-1 inline" /> New Record
        </Button>
      </div>

      <DataTable columns={columns} data={logs as unknown as Record<string, unknown>[]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Maintenance Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <Select label="Vehicle" name="vehicleId" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            options={vehicles.filter((v) => v.status !== "Retired").map((v) => ({ value: v.id, label: `${v.registrationNo} - ${v.name}` }))} required />
          <Select label="Maintenance Type" name="type" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={types.map((t) => ({ value: t, label: t }))} required />
          <Input label="Description" name="description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="e.g. Regular 10,000km service" />
          <Input label="Cost (Rs.)" name="cost" type="number" value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Record</Button>
          </div>
        </form>
      </Modal>
    </Sidebar>
  );
}
