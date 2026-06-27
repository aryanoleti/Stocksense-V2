"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Loader2 } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState<SignupInput>({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: any = {};
      parsed.error.issues.forEach((i) => { fieldErrors[i.path[0]] = i.message; });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setServerError(data.error || "Registration failed");
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">Join StockSense — it's free</p>
      </div>

      <div className="card-glass p-6 space-y-4">
        {serverError && (
          <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "name", label: "Full Name", type: "text", placeholder: "Rahul Sharma" },
            { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          ].map((f) => (
            <div key={f.name}>
              <label className="text-xs text-muted-foreground block mb-1.5">{f.label}</label>
              <input
                type={f.type} name={f.name}
                value={(form as any)[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
              />
              {(errors as any)[f.name] && <p className="text-xs text-red-400 mt-1">{(errors as any)[f.name]}</p>}
            </div>
          ))}

          {["password", "confirmPassword"].map((field) => (
            <div key={field}>
              <label className="text-xs text-muted-foreground block mb-1.5">
                {field === "password" ? "Password" : "Confirm Password"}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} name={field}
                  value={(form as any)[field]}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
                {field === "password" && (
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
              {(errors as any)[field] && <p className="text-xs text-red-400 mt-1">{(errors as any)[field]}</p>}
            </div>
          ))}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create Account
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
