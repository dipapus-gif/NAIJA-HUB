"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, acceptTerms: accept }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
      router.refresh();
    } catch {
      setError("Network problem. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-950 placeholder:text-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {isRegister && (
        <label className="block">
          <span className="text-xs font-semibold text-stone-700">Full name</span>
          <input className={`${input} mt-1`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </label>
      )}
      <label className="block">
        <span className="text-xs font-semibold text-stone-700">Email</span>
        <input className={`${input} mt-1`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-stone-700">Password</span>
        <div className="relative mt-1">
          <input
            className={`${input} pr-11`}
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={isRegister ? 8 : undefined}
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {isRegister && <span className="text-[11px] text-stone-500">At least 8 characters.</span>}
      </label>

      {isRegister && (
        <label className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 accent-emerald-700" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-emerald-800 underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="font-semibold text-emerald-800 underline">Privacy Policy</Link>.
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || (isRegister && !accept)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3 transition cursor-pointer"
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {isRegister ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-xs text-stone-600">
        {isRegister ? (
          <>Already have an account? <Link href="/login" className="font-semibold text-emerald-800 underline">Log in</Link></>
        ) : (
          <>New to Naija Hub? <Link href="/register" className="font-semibold text-emerald-800 underline">Create an account</Link></>
        )}
      </p>
    </form>
  );
}
