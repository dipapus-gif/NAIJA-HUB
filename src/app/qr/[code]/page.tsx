import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { QrApprove } from "@/components/site/QrApprove";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Approve QR login — Naija Hub", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function QrPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getCurrentUser();
  return (
    <PageShell>
      <div className="rounded-2xl bg-white text-stone-950 border border-stone-200 p-6 sm:p-8 shadow-xl">
        {user ? (
          <QrApprove code={code} name={user.name} />
        ) : (
          <div className="text-center">
            <h1 className="font-display font-bold text-xl">Log in to approve</h1>
            <p className="text-sm text-stone-600 mt-2">Log in on this phone first, then scan the QR code again.</p>
            <Link href={`/login?next=${encodeURIComponent(`/qr/${code}`)}`} className="mt-5 block rounded-xl bg-emerald-900 text-white font-bold text-sm py-3">
              Log in
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
