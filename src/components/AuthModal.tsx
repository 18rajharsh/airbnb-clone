import React, { useState } from "react";
import { X, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    demoUsers,
    switchUser,
  } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("guest");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authModalMode === "login") {
      const res = login(email);
      if (!res.success) setErrorMsg(res.message || "Login failed");
    } else {
      const res = register({ name, email, role });
      if (!res.success) setErrorMsg(res.message || "Registration failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">
            {authModalMode === "login" ? "Log in to Airbnb" : "Create an Airbnb account"}
          </h2>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Quick Demo Switcher */}
          <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Instant One-Click Demo Profiles</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {demoUsers.slice(0, 3).map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => {
                    switchUser(u);
                    setAuthModalOpen(false);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200 hover:border-neutral-900 transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-neutral-800">{u.name}</p>
                      <p className="text-[10px] text-neutral-500">{u.role === "host" ? "Superhost" : "Traveler"}</p>
                    </div>
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode("login");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authModalMode === "login" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode("register");
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                authModalMode === "register" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {authModalMode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:border-neutral-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-semibold bg-white outline-none"
                  >
                    <option value="guest">Guest (Traveler)</option>
                    <option value="host">Host (List Properties)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:border-neutral-900 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-xl text-xs hover:opacity-95 shadow-sm transition"
            >
              {authModalMode === "login" ? "Continue" : "Agree and Sign up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
