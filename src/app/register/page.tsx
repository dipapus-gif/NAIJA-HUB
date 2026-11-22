import type { Metadata } from "next";
import { AuthForm } from "@/components/site/AuthForm";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = { title: "Sign up — Naija Hub" };

export default function Page() {
  return (
    <PageShell>
      <div className="rounded-2xl bg-white text-stone-950 border border-stone-200 p-6 sm:p-8 shadow-xl">
        <h1 className="font-display font-bold text-2xl">Create your account</h1>
        <p className="text-sm text-stone-600 mt-1 mb-6">Join Naija Hub — free, works on weak data.</p>
        <AuthForm mode="register" />
      </div>
    </PageShell>
  );
}
