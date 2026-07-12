"use client";

import Sidebar from "@/components/Sidebar";
import { KpiCard, Select, Skeleton } from "@/components/ui";
import { Car, Truck, Wrench, Map, Clock, Users, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface ActiveTripItem {
  id: string;
  source: string;
  destination: string;
  cargoWeight: number;
  plannedDistance: number;
  vehicle: { name: string; registrationNo: string };
  driver: { name: string };
}

interface DashboardData {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
  activeTripsList: ActiveTripItem[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState({ vehicleType: "", status: "", region: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NOTE: Move fetch function inside useEffect to fix dependency array warning.
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.vehicleType) params.set("vehicleType", filters.vehicleType);
        if (filters.status) params.set("status", filters.status);
        if (filters.region) params.set("region", filters.region);
        
        const res = await apiFetch<DashboardData>(`/api/dashboard?${params}`);
        setData(res);
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [filters]);

  return (
    <Sidebar>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500 text-sm">Fleet overview and key metrics</p>
      </div>

      {/* Unified Filters using custom Select component */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Select
          value={filters.vehicleType}
          onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
          placeholder="All Vehicle Types"
          options={[
            { value: "Truck", label: "Truck" },
            { value: "Van", label: "Van" },
            { value: "Bus", label: "Bus" },
            { value: "Tanker", label: "Tanker" },
          ]}
        />
        <Select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          placeholder="All Statuses"
          options={[
            { value: "Available", label: "Available" },
            { value: "On Trip", label: "On Trip" },
            { value: "In Shop", label: "In Shop" },
            { value: "Retired", label: "Retired" },
          ]}
        />
        <Select
          value={filters.region}
          onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          placeholder="All Regions"
          options={[
            { value: "North", label: "North" },
            { value: "South", label: "South" },
            { value: "East", label: "East" },
            { value: "West", label: "West" },
            { value: "General", label: "General" },
          ]}
        />
      </div>

      {/* Loading skeleton wrapper */}
      {loading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg bg-slate-200" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-16 bg-slate-200" />
                <Skeleton className="h-4 w-24 bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Active Vehicles" value={data.activeVehicles} icon={<Car className="w-5 h-5 text-brand-medium" />} color="bg-brand-medium/10" />
            <KpiCard label="Available Vehicles" value={data.availableVehicles} icon={<Truck className="w-5 h-5 text-green-600" />} color="bg-green-50" />
            <KpiCard label="In Maintenance" value={data.vehiclesInMaintenance} icon={<Wrench className="w-5 h-5 text-yellow-600" />} color="bg-yellow-50" />
            <KpiCard label="Active Trips" value={data.activeTrips} icon={<Map className="w-5 h-5 text-purple-600" />} color="bg-purple-50" />
            <KpiCard label="Pending Trips" value={data.pendingTrips} icon={<Clock className="w-5 h-5 text-orange-600" />} color="bg-orange-50" />
            <KpiCard label="Drivers On Duty" value={data.driversOnDuty} icon={<Users className="w-5 h-5 text-indigo-600" />} color="bg-indigo-50" />
            <KpiCard label="Fleet Utilization" value={`${data.fleetUtilization}%`} icon={<BarChart3 className="w-5 h-5 text-teal-600" />} color="bg-teal-50" />
          </div>

          {/* Active Shipments Console */}
          {data.activeTripsList && data.activeTripsList.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Live Shipments Transit Board</h2>
                  <p className="text-slate-500 text-xs">Real-time tracking of active dispatch runs</p>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Live System Active</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.activeTripsList.map((trip) => (
                  <div key={trip.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-light/20 text-brand-dark uppercase tracking-wider">
                          En Route
                        </span>
                        <h3 className="font-semibold text-slate-800 mt-1">
                          {trip.source} &rarr; {trip.destination}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">ID: {trip.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    
                    {/* Visual Progress Line */}
                    <div className="relative pt-1 mb-4">
                      <div className="flex mb-2 items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Transit Progress</span>
                        <span className="text-slate-700 font-bold">58%</span>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-100">
                        <div style={{ width: "58%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-medium transition-all duration-500"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs border-t pt-3 border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Vehicle</span>
                        <span className="font-semibold text-slate-700 truncate block">{trip.vehicle.name}</span>
                        <span className="text-[9px] text-slate-500 block font-mono">{trip.vehicle.registrationNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Driver</span>
                        <span className="font-semibold text-slate-700 truncate block">{trip.driver.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Payload</span>
                        <span className="font-semibold text-slate-700 block">{trip.cargoWeight.toLocaleString("en-IN")} kg</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Sidebar>
  );
}
