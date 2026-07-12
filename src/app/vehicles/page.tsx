"use client";

import Sidebar from "@/components/Sidebar";
import { DataTable, StatusBadge, Button, Input, Select } from "@/components/ui";
import Modal from "@/components/Modal";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/Modal";

interface Vehicle {
  id: string;
  registrationNo: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  status: string;
  region: string;
}

const vehicleTypes = ["Truck", "Van", "Bus", "Tanker"];
const statuses = ["Available", "On Trip", "In Shop", "Retired"];
const regions = ["North", "South", "East", "West", "General"];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({
    registrationNo: "", name: "", type: "Truck", maxLoadCapacity: "",
    odometer: "", acquisitionCost: "", region: "General", status: "Available",
  });
  const [error, setError] = useState("");

  const fetchVehicles = () => {
    fetch("/api/vehicles").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setVehicles(data);
    });
  };

  useEffect(() => { fetchVehicles(); }, []);

  const openCreate = () => {
    setEditVehicle(null);
    setForm({ registrationNo: "", name: "", type: "Truck", maxLoadCapacity: "", odometer: "", acquisitionCost: "", region: "General", status: "Available" });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditVehicle(v);
    setForm({
      registrationNo: v.registrationNo, name: v.name, type: v.type,
      maxLoadCapacity: String(v.maxLoadCapacity), odometer: String(v.odometer),
      acquisitionCost: String(v.acquisitionCost), region: v.region, status: v.status,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editVehicle ? `/api/vehicles/${editVehicle.id}` : "/api/vehicles";
    const method = editVehicle ? "PUT" : "POST";
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setModalOpen(false);
    fetchVehicles();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/vehicles/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchVehicles();
  };

  const columns = [
    { key: "registrationNo", label: "Reg. No." },
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "maxLoadCapacity", label: "Max Load (kg)", render: (v: unknown) => `${Number(v).toLocaleString()}` },
    { key: "odometer", label: "Odometer (km)", render: (v: unknown) => Number(v).toLocaleString() },
    { key: "acquisitionCost", label: "Cost", render: (v: unknown) => `Rs. ${Number(v).toLocaleString("en-IN")}` },
    { key: "region", label: "Region" },
    { key: "status", label: "Status", render: (v: unknown) => <StatusBadge status={String(v)} /> },
    {
      key: "actions", label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row as unknown as Vehicle); }}
            className="p-1.5 text-slate-400 hover:text-brand-medium hover:bg-brand-cream rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row as unknown as Vehicle); }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Sidebar>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vehicle Registry</h1>
          <p className="text-slate-500 text-sm">Manage your fleet vehicles</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1 inline" /> Add Vehicle</Button>
      </div>

      <DataTable columns={columns} data={vehicles as unknown as Record<string, unknown>[]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editVehicle ? "Edit Vehicle" : "Add Vehicle"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <Input label="Registration Number" name="registrationNo" value={form.registrationNo}
            onChange={(e) => setForm({ ...form, registrationNo: e.target.value })} required placeholder="e.g. MH-12-AB-1234" />
          <Input label="Vehicle Name/Model" name="name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Tata Ace Gold" />
          <Select label="Vehicle Type" name="type" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={vehicleTypes.map((t) => ({ value: t, label: t }))} required />
          <Input label="Max Load Capacity (kg)" name="maxLoadCapacity" type="number" value={form.maxLoadCapacity}
            onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })} required />
          <Input label="Odometer (km)" name="odometer" type="number" value={form.odometer}
            onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
          <Input label="Acquisition Cost (Rs.)" name="acquisitionCost" type="number" value={form.acquisitionCost}
            onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} required />
          <Select label="Region" name="region" value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            options={regions.map((r) => ({ value: r, label: r }))} />
          {editVehicle && (
            <Select label="Status" name="status" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={statuses.map((s) => ({ value: s, label: s }))} />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editVehicle ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Vehicle" message={`Are you sure you want to delete ${deleteTarget?.name}?`} />
    </Sidebar>
  );
}
