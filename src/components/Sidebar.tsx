"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Car,
  Users,
  Map,
  Wrench,
  Fuel,
  BarChart3,
  LogOut,
  Menu,
  X,
  Truck,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/fuel-expenses", label: "Fuel & Expenses", icon: Fuel },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      admin: "Administrator",
      fleet_manager: "Fleet Manager",
      driver: "Driver",
      safety_officer: "Safety Officer",
      financial_analyst: "Financial Analyst",
    };
    return map[role] || role;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`bg-brand-dark text-slate-300 flex flex-col transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-brand-medium/20">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Truck className="w-6 h-6 text-brand-light flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg leading-tight">TransitOps</span>
                <span className="text-[9px] font-bold tracking-wider text-brand-light uppercase leading-none">India Logistics</span>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white">
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-medium/20 text-brand-light border-r-2 border-brand-light"
                    : "text-slate-400 hover:bg-brand-medium/25 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {user && !collapsed && (
          <div className="p-4 border-t border-brand-medium/20">
            <div className="text-sm font-medium text-white">{user.name}</div>
            <div className="text-xs text-slate-400">{roleLabel(user.role)}</div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:bg-brand-medium/25 hover:text-red-400 border-t border-brand-medium/20"
          title="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
