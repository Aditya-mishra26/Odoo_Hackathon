"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark via-[#1a3832] to-brand-medium">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-medium rounded-2xl mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">TransitOps</h1>
          <p className="text-slate-400 mt-2">Smart Transport & Fleet Operations Platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@transitops.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-brand-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 border border-brand-light rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-medium text-white py-2.5 rounded-lg font-medium hover:bg-brand-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-brand-cream/50 rounded-lg">
            <p className="text-xs text-slate-500 font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-slate-600">
              <p><strong>Admin:</strong> admin@transitops.com / admin123</p>
              <p><strong>Fleet Manager:</strong> fleet@transitops.com / fleet123</p>
              <p><strong>Safety Officer:</strong> safety@transitops.com / safety123</p>
              <p><strong>Analyst:</strong> analyst@transitops.com / analyst123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
