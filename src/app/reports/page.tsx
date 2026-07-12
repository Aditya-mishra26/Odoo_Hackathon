"use client";

import Sidebar from "@/components/Sidebar";
import { Button, DataTable } from "@/components/ui";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface VehicleStat {
  vehicleId: string; registrationNo: string; name: string; type: string;
  totalTrips: number; totalDistance: number; totalFuelLiters: number;
  fuelEfficiency: number; totalFuelCost: number; totalMaintenanceCost: number;
  totalExpenseCost: number; totalOperationalCost: number; revenue: number; roi: number;
}

interface FleetUtil { type: string; total: number; onTrip: number; utilization: number }
interface MonthlyExp { month: string; fuel: number; maintenance: number; other: number }

interface ReportData {
  vehicleStats: VehicleStat[];
  fleetUtilization: { byType: FleetUtil[] };
  monthlyExpenses: MonthlyExp[];
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch("/api/reports").then((r) => r.json()).then(setData);
  }, []);

  const exportCSV = () => {
    if (!data) return;
    const headers = ["Registration", "Name", "Type", "Trips", "Distance", "Fuel Efficiency", "Fuel Cost", "Maintenance Cost", "Other Cost", "Total Cost", "Revenue", "ROI%"];
    const rows = data.vehicleStats.map((v) => [
      v.registrationNo, v.name, v.type, v.totalTrips, v.totalDistance.toFixed(1),
      v.fuelEfficiency.toFixed(2), v.totalFuelCost.toFixed(2), v.totalMaintenanceCost.toFixed(2),
      v.totalExpenseCost.toFixed(2), v.totalOperationalCost.toFixed(2), v.revenue.toFixed(2), v.roi.toFixed(2),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transitops-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: "registrationNo", label: "Vehicle" },
    { key: "type", label: "Type" },
    { key: "totalTrips", label: "Trips" },
    { key: "totalDistance", label: "Distance (km)", render: (v: unknown) => Number(v).toFixed(1) },
    { key: "fuelEfficiency", label: "Fuel Eff. (km/L)", render: (v: unknown) => Number(v).toFixed(2) },
    { key: "totalFuelCost", label: "Fuel Cost", render: (v: unknown) => `Rs. ${Number(v).toLocaleString("en-IN")}` },
    { key: "totalMaintenanceCost", label: "Maint. Cost", render: (v: unknown) => `Rs. ${Number(v).toLocaleString("en-IN")}` },
    { key: "totalOperationalCost", label: "Total Cost", render: (v: unknown) => `Rs. ${Number(v).toLocaleString("en-IN")}` },
    { key: "revenue", label: "Revenue", render: (v: unknown) => `Rs. ${Number(v).toLocaleString("en-IN")}` },
    { key: "roi", label: "ROI %", render: (v: unknown) => <span className={Number(v) >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{Number(v).toFixed(2)}%</span> },
  ];

  return (
    <Sidebar>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm">Fleet performance, costs, and profitability</p>
        </div>
        <Button onClick={exportCSV}><Download className="w-4 h-4 mr-1 inline" /> Export CSV</Button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold mb-4">Monthly Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="fuel" fill="#3b82f6" name="Fuel" />
                  <Bar dataKey="maintenance" fill="#22c55e" name="Maintenance" />
                  <Bar dataKey="other" fill="#f59e0b" name="Other" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold mb-4">Fleet Utilization by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.fleetUtilization.byType} dataKey="utilization" nameKey="type" cx="50%" cy="50%" outerRadius={100}>
                    {(data.fleetUtilization.byType.map((item) => ({ ...item, name: item.type }))).map((_: FleetUtil, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-5">
              <h4 className="text-sm text-slate-500">Avg Fuel Efficiency</h4>
              <div className="text-2xl font-bold">
                {data.vehicleStats.length > 0
                  ? (data.vehicleStats.reduce((s, v) => s + v.fuelEfficiency, 0) / data.vehicleStats.length).toFixed(2)
                  : 0} km/L
              </div>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <h4 className="text-sm text-slate-500">Total Operational Cost</h4>
              <div className="text-2xl font-bold text-red-600">
                Rs. {data.vehicleStats.reduce((s, v) => s + v.totalOperationalCost, 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-white rounded-xl border p-5">
              <h4 className="text-sm text-slate-500">Total Revenue</h4>
              <div className="text-2xl font-bold text-green-600">
                Rs. {data.vehicleStats.reduce((s, v) => s + v.revenue, 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <DataTable columns={columns} data={data.vehicleStats as unknown as Record<string, unknown>[]} />
        </>
      )}
    </Sidebar>
  );
}
