"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Download,
  Play,
  RotateCcw,
  Smartphone,
  Terminal,
  X,
  XCircle,
} from "lucide-react";
import { runLietCalculationTests } from "@/lib/calculations";
import type { NaijaHubDeviceState } from "@/lib/localStore";

interface CalcTestModalProps {
  open: boolean;
  onClose: () => void;
  swActive: boolean;
  storageBytes: number;
  deviceState: NaijaHubDeviceState;
  onResetDeviceState: () => void;
}

export function CalcTestModal({
  open,
  onClose,
  swActive,
  storageBytes,
  deviceState,
  onResetDeviceState,
}: CalcTestModalProps) {
  const [suiteRun, setSuiteRun] = useState(() => runLietCalculationTests());
  const [runCount, setRunCount] = useState(1);

  if (!open) return null;

  const handleRerun = () => {
    setSuiteRun(runLietCalculationTests());
    setRunCount((c) => c + 1);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(deviceState, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naija-hub-phone-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[88vh] rounded-3xl bg-stone-950 text-stone-100 border border-emerald-800/80 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="px-6 py-4 bg-emerald-950/90 border-b border-emerald-800/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                LIET&apos;s Calculation Test Suite &amp; Offline Device Diagnostics
              </h3>
              <p className="font-mono text-xs text-emerald-300">
                Run #{runCount} • {suiteRun.passed}/{suiteRun.total} Assertions
                Passed in {suiteRun.durationMs}ms
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-emerald-900/80 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Cards */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="text-[11px] font-mono text-stone-400">
                CALCULATION ENGINE
              </div>
              <div className="font-mono text-xl font-bold text-emerald-400 mt-1">
                {suiteRun.passed} / {suiteRun.total} PASSING
              </div>
              <button
                type="button"
                onClick={handleRerun}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Re-run Live Checks
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="text-[11px] font-mono text-stone-400">
                PWA &amp; SERVICE WORKER
              </div>
              <div className="font-mono text-base font-bold text-white mt-1">
                {swActive ? "✓ Offline Cache Active" : "Manifest Ready"}
              </div>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                Android Chrome &amp; iPhone Safari
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="text-[11px] font-mono text-stone-400">
                ON-PHONE LOCAL STORAGE
              </div>
              <div className="font-mono text-xl font-bold text-amber-300 mt-1">
                {(storageBytes / 1024).toFixed(2)} KB
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200"
                >
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
                <button
                  type="button"
                  onClick={onResetDeviceState}
                  className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                </button>
              </div>
            </div>
          </div>

          {/* Install on Android & iPhone Guide */}
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-100 grid sm:grid-cols-2 gap-4">
            <div>
              <strong className="text-amber-300 font-mono block mb-1">
                INSTALL ON ANDROID (CHROME / EDGE):
              </strong>
              Tap browser menu (⋮) → <strong>&ldquo;Install app&rdquo;</strong> or{" "}
              <strong>&ldquo;Add to Home screen&rdquo;</strong>. Launches full-screen and runs offline.
            </div>
            <div>
              <strong className="text-amber-300 font-mono block mb-1">
                INSTALL ON IPHONE (SAFARI iOS):
              </strong>
              Tap the <strong>Share</strong> icon (square with arrow ↑) →{" "}
              <strong>&ldquo;Add to Home Screen&rdquo;</strong>. All 10 tools stay saved on your iPhone.
            </div>
          </div>

          {/* 18 Assertions Table */}
          <div className="space-y-2">
            {suiteRun.results.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-mono text-amber-300 font-bold mr-2">
                      [{r.id} • {r.module}]
                    </span>
                    <span className="text-stone-200">{r.assertion}</span>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-emerald-300 bg-stone-950 px-2.5 py-1 rounded border border-stone-800 shrink-0">
                  {r.actual}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
