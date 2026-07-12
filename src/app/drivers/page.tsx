"use client";

import Sidebar from "@/components/Sidebar";
import { DataTable, StatusBadge, Button, Input, Select, TableSkeleton } from "@/components/ui";
import Modal from "@/components/Modal";
import { ConfirmModal } from "@/components/Modal";
import { useEffect, useState, useCallback } from "react";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: string;
  region: string;
}

const categories = ["LMV-GV", "HMV", "TRANS", "MCWG"];
const regions = ["North", "South", "East", "West", "General"];

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);
  const [form, setForm] = useState({
    name: "", licenseNumber: "", licenseCategory: "B",
    licenseExpiry: "", contactNumber: "", safetyScore: "100", region: "General",
  });
  const [error, setError] = useState("");

  // NOTE: Wrapped in useCallback to prevent infinite render loops in dependency arrays.
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const d = await apiFetch<Driver[]>("/api/drivers");
      if (Array.isArray(d)) setDrivers(d);
    } catch (err) {
      console.error("Failed to load drivers", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const openCreate = () => {
    setEditDriver(null);
    setForm({ name: "", licenseNumber: "", licenseCategory: "B", licenseExpiry: "", contactNumber: "", safetyScore: "100", region: "General" });
    setError(""); setModalOpen(true);
  };

  const openEdit = (d: Driver) => {
    setEditDriver(d);
    setForm({
      name: d.name, licenseNumber: d.licenseNumber, licenseCategory: d.licenseCategory,
      licenseExpiry: d.licenseExpiry.split("T")[0], contactNumber: d.contactNumber,
      safetyScore: String(d.safetyScore), region: d.region,
    });
    setError(""); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const url = editDriver ? `/api/drivers/${editDriver.id}` : "/api/drivers";
    const method = editDriver ? "PUT" : "POST";
    try {
      await apiFetch(url, {
        method,
        body: JSON.stringify(form),
      });
      setModalOpen(false);
      fetchDrivers();
    } catch (err: any) {
      setError(err.message || "Failed to save driver");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiFetch(`/api/drivers/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchDrivers();
    } catch (err) {
      console.error("Failed to delete driver", err);
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  const columns = [
    { key: "name", label: "Name" },
    { key: "licenseNumber", label: "License No." },
    { key: "licenseCategory", label: "Category" },
    {
      key: "licenseExpiry", label: "License Expiry",
      render: (v: unknown) => (
        <span className={isExpired(String(v)) ? "text-red-600 font-medium flex items-center gap-1" : ""}>
          {new Date(String(v)).toLocaleDateString()}
          {isExpired(String(v)) && <AlertTriangle className="w-3.5 h-3.5" />}
        </span>
      ),
    },
    { key: "contactNumber", label: "Contact" },
    {
      key: "safetyScore", label: "Safety Score",
      render: (v: unknown) => {
        const score = Number(v);
        const color = score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
        return <span className={`font-medium ${color}`}>{score}</span>;
      },
    },
    { key: "region", label: "Region" },
    { key: "status", label: "Status", render: (v: unknown) => <StatusBadge status={String(v)} /> },
    {
      key: "actions", label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row as unknown as Driver); }}
            className="p-1.5 text-slate-400 hover:text-brand-medium hover:bg-brand-cream rounded"><Edit className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row as unknown as Driver); }}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <Sidebar>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Driver Management</h1>
          <p className="text-slate-500 text-sm">Manage drivers and license compliance</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1 inline" /> Add Driver</Button>
      </div>

      {loading ? (
        <TableSkeleton rows={6} columns={9} />
      ) : (
        <DataTable columns={columns} data={drivers as unknown as Record<string, unknown>[]} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editDriver ? "Edit Driver" : "Add Driver"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <Input label="Full Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="License Number" name="licenseNumber" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
          <Select label="License Category" name="licenseCategory" value={form.licenseCategory}
            onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}
            options={categories.map((c) => ({ value: c, label: c }))} required />
          <Input label="License Expiry Date" name="licenseExpiry" type="date" value={form.licenseExpiry}
            onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} required />
          <Input label="Contact Number" name="contactNumber" value={form.contactNumber}
            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required />
          <Input label="Safety Score" name="safetyScore" type="number" value={form.safetyScore}
            onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
          <Select label="Region" name="region" value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            options={regions.map((r) => ({ value: r, label: r }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editDriver ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Driver" message={`Are you sure you want to delete ${deleteTarget?.name}?`} />
    </Sidebar>
  );
}
