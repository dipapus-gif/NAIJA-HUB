"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";

interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export function AccountMenu() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  if (!ready) return <div className="w-16 h-8" aria-hidden />;

  if (user) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-800 text-[11px] font-semibold text-emerald-100"
          title={user.email}
        >
          <UserRound className="w-3.5 h-3.5 text-amber-300" />
          {user.name.split(" ")[0]}
        </span>
        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          title="Log out"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-emerald-800 bg-emerald-950 text-emerald-200 hover:text-white hover:border-amber-400 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-700 text-emerald-100 hover:border-amber-400 hover:text-amber-300 text-xs font-bold transition"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Log in</span>
      </Link>
      <Link
        href="/register"
        className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-amber-400 text-stone-950 hover:bg-amber-300 text-xs font-bold transition"
      >
        Sign up
      </Link>
    </div>
  );
}
