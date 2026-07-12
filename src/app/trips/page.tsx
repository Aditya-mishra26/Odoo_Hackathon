"use client";

import Sidebar from "@/components/Sidebar";
import { DataTable, StatusBadge, Button, Input, Select } from "@/components/ui";
import Modal from "@/components/Modal";
import { useEffect, useState } from "react";
import { Plus, Play, CheckCircle, XCircle } from "lucide-react";

interface Trip {
  id: string; source: string; destination: string; vehicleId: string; driverId: string;
  cargoWeight: number; plannedDistance: number; actualDistance: number | null;
  fuelConsumed: number | null; status: string; tripRevenue: number | null;
  finalOdometer: number | null; vehicle: { registrationNo: string; name: string }; driver: { name: string; licenseNumber: string };
}
interface Vehicle { id: string; registrationNo: string; name: string; status: string; maxLoadCapacity: number; }
interface Driver { id: string; name: string; licenseNumber: string; status: string; licenseExpiry: string; }

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [completeModal, setCompleteModal] = useState<Trip | null>(null);
  const [form, setForm] = useState({ source: "", destination: "", vehicleId: "", driverId: "", cargoWeight: "", plannedDistance: "" });
  const [completeForm, setCompleteForm] = useState({ actualDistance: "", fuelConsumed: "", finalOdometer: "", tripRevenue: "" });
  const [error, setError] = useState("");

  const fetchAll = () => {
    fetch("/api/trips").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setTrips(d); });
    fetch("/api/vehicles").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setVehicles(d); });
    fetch("/api/drivers").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setDrivers(d); });
  };

  useEffect(() => { fetchAll(); }, []);

  const availableVehicles = vehicles.filter((v) => v.status === "Available");
  const availableDrivers = drivers.filter((d) => d.status === "Available" && new Date(d.licenseExpiry) > new Date());

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (selectedVehicle && parseFloat(form.cargoWeight) > selectedVehicle.maxLoadCapacity) {
      setError(`Cargo weight exceeds max capacity of ${selectedVehicle.maxLoadCapacity}kg`);
      return;
    }
    const res = await fetch("/api/trips", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setModalOpen(false); fetchAll();
  };

  const handleDispatch = async (trip: Trip) => {
    await fetch(`/api/trips/${trip.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Dispatched" }) });
    fetchAll();
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault(); if (!completeModal) return;
    await fetch(`/api/trips/${completeModal.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...completeForm, status: "Completed" }),
    });
    setCompleteModal(null); fetchAll();
  };

  const handleCancel = async (trip: Trip) => {
    await fetch(`/api/trips/${trip.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "Cancelled" }) });
    fetchAll();
  };

  const columns = [
    { key: "source", label: "Source" },
    { key: "destination", label: "Destination" },
    { key: "vehicle", label: "Vehicle", render: (_: unknown, row: Record<string, unknown>) => (row.vehicle as Trip["vehicle"])?.registrationNo },
    { key: "driver", label: "Driver", render: (_: unknown, row: Record<string, unknown>) => (row.driver as Trip["driver"])?.name },
    { key: "cargoWeight", label: "Cargo (kg)", render: (v: unknown) => Number(v).toLocaleString() },
    { key: "plannedDistance", label: "Distance (km)", render: (v: unknown) => Number(v).toLocaleString() },
    { key: "status", label: "Status", render: (v: unknown) => <StatusBadge status={String(v)} /> },
    {
      key: "actions", label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const trip = row as unknown as Trip;
        return (
          <div className="flex gap-1">
            {trip.status === "Draft" && (
              <button onClick={(e) => { e.stopPropagation(); handleDispatch(trip); }}
                className="p-1.5 text-brand-medium hover:bg-brand-cream rounded" title="Dispatch">
                <Play className="w-4 h-4" />
              </button>
            )}
            {trip.status === "Dispatched" && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setCompleteModal(trip); setCompleteForm({ actualDistance: String(trip.plannedDistance), fuelConsumed: "", finalOdometer: "", tripRevenue: "" }); }}
                  className="p-1.5 text-brand-medium hover:bg-brand-cream rounded" title="Complete">
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleCancel(trip); }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Cancel">
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Sidebar>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trip Management</h1>
          <p className="text-slate-500 text-sm">Create and manage dispatch trips</p>
        </div>
        <Button onClick={() => { setForm({ source: "", destination: "", vehicleId: "", driverId: "", cargoWeight: "", plannedDistance: "" }); setError(""); setModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-1 inline" /> New Trip
        </Button>
      </div>

      <DataTable columns={columns} data={trips as unknown as Record<string, unknown>[]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Trip">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <Input label="Source" name="source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required placeholder="e.g. Mumbai" />
          <Input label="Destination" name="destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required placeholder="e.g. Pune" />
          <Select label="Vehicle" name="vehicleId" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            options={availableVehicles.map((v) => ({ value: v.id, label: `${v.registrationNo} - ${v.name} (${v.maxLoadCapacity}kg)` }))} required />
          <Select label="Driver" name="driverId" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}
            options={availableDrivers.map((d) => ({ value: d.id, label: `${d.name} (${d.licenseNumber})` }))} required />
          {availableDrivers.length === 0 && <p className="text-xs text-red-500">No available drivers with valid licenses</p>}
          <Input label="Cargo Weight (kg)" name="cargoWeight" type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} required />
          {selectedVehicle && form.cargoWeight && parseFloat(form.cargoWeight) > selectedVehicle.maxLoadCapacity && (
            <p className="text-xs text-red-500">Exceeds max capacity of {selectedVehicle.maxLoadCapacity}kg</p>
          )}
          <Input label="Planned Distance (km)" name="plannedDistance" type="number" value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Trip</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Trip">
        <form onSubmit={handleComplete} className="space-y-4">
          <Input label="Actual Distance (km)" name="actualDistance" type="number" value={completeForm.actualDistance}
            onChange={(e) => setCompleteForm({ ...completeForm, actualDistance: e.target.value })} required />
          <Input label="Fuel Consumed (liters)" name="fuelConsumed" type="number" value={completeForm.fuelConsumed}
            onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })} required />
          <Input label="Final Odometer (km)" name="finalOdometer" type="number" value={completeForm.finalOdometer}
            onChange={(e) => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })} />
          <Input label="Trip Revenue (Rs.)" name="tripRevenue" type="number" value={completeForm.tripRevenue}
            onChange={(e) => setCompleteForm({ ...completeForm, tripRevenue: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCompleteModal(null)}>Cancel</Button>
            <Button variant="success" type="submit">Complete Trip</Button>
          </div>
        </form>
      </Modal>
    </Sidebar>
  );
}
