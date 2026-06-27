"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, TrendingUp, MessageSquare, Loader2, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
  emailVerified: Date | null;
  _count: { transactions: number; chatSessions: number };
}

interface Props {
  user: UserData;
  portfolio: { cashBalance: number; totalInvested: number; holdings: any[] } | null;
}

export function ProfileForm({ user, portfolio }: Props) {
  const router = useRouter();
  const [name, setName] = useState(user.name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (name.length < 2) { setNameError("Name must be at least 2 characters"); return; }
    setSaving(true); setNameError("");
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); router.refresh(); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdError("Passwords do not match"); return; }
    if (newPwd.length < 8) { setPwdError("Password must be at least 8 characters"); return; }
    setPwdLoading(true); setPwdError("");
    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
    });
    setPwdLoading(false);
    if (res.ok) {
      setPwdSuccess(true);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => setPwdSuccess(false), 3000);
    } else {
      const data = await res.json();
      setPwdError(data.error || "Failed to change password");
    }
  }

  const netWorth = (portfolio?.cashBalance || 0) + (portfolio?.totalInvested || 0);

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="card-glass p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary">
          {user.image ? (
            <img src={user.image} alt={user.name || ""} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            (user.name?.charAt(0) || "U").toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <div className="font-bold text-foreground text-lg">{user.name || "No name"}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === "ADMIN" ? "bg-yellow-400/10 text-yellow-400" : "bg-primary/10 text-primary"}`}>
              {user.role}
            </span>
            {user.emailVerified && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 font-medium">
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: "Member since", value: new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) },
          { icon: TrendingUp, label: "Total trades", value: user._count.transactions },
          { icon: MessageSquare, label: "AI chats", value: user._count.chatSessions },
          { icon: Shield, label: "Net worth", value: formatCurrency(netWorth) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="stat-card">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm font-semibold text-foreground mt-1">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Edit name */}
      <div className="card-glass p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Personal Information
        </h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Display name</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
            />
            {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
            <input
              value={user.email}
              readOnly
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <button
            type="submit"
            disabled={saving || saved}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saved && <Check className="w-3.5 h-3.5" />}
            {saved ? "Saved!" : "Save changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card-glass p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Change Password
        </h2>
        {pwdSuccess && (
          <div className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg p-3 mb-4">
            Password changed successfully
          </div>
        )}
        {pwdError && (
          <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 mb-4">
            {pwdError}
          </div>
        )}
        <form onSubmit={changePassword} className="space-y-4">
          {[
            { label: "Current password", value: currentPwd, set: setCurrentPwd },
            { label: "New password", value: newPwd, set: setNewPwd },
            { label: "Confirm new password", value: confirmPwd, set: setConfirmPwd },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
              <input
                type="password"
                value={value}
                onChange={(e) => { set(e.target.value); setPwdError(""); }}
                placeholder="••••••••"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={pwdLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {pwdLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
