import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LangBar } from "./LangBar";
import { SideMenu } from "./SideMenu";

export function PageShell({ children, wide = false }: { children: ReactNode; wide?: boolean | "xl" }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#061A14] text-stone-100">
      <LangBar />
      <SideMenu />
      <header className="border-b border-emerald-900/80">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/naija-hub-icon.png" alt="" className="w-9 h-9 rounded-xl border border-emerald-700/60" />
            <span className="font-display font-bold text-lg text-white">Naija Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-100 hover:text-amber-300">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to app
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className={`flex-1 w-full mx-auto px-4 py-12 ${wide === "xl" ? "max-w-5xl" : wide ? "max-w-3xl" : "max-w-md"}`}>{children}</main>
      <footer className="site-foot border-t border-emerald-900/80 py-6 text-center text-xs text-emerald-100/70">
        <Link href="/terms" className="hover:text-amber-300">Terms of Service</Link>
        <span className="mx-3">•</span>
        <Link href="/privacy" className="hover:text-amber-300">Privacy Policy</Link>
        <span className="mx-3">•</span>
        <Link href="/data-inventory" className="hover:text-amber-300">Data Inventory</Link>
      </footer>
    </div>
  );
}
