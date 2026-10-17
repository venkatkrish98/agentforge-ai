"use client";

import React from "react";
import { FinalReport, Task } from "@/lib/types/task";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, Download, FileCheck2, Cpu } from "lucide-react";

interface FinalReportViewerProps {
  task: Task;
}

export const FinalReportViewer: React.FC<FinalReportViewerProps> = ({ task }) => {
  const report = task.finalReport;

  if (!report) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-forge-850 border border-forge-800 text-forge-400 flex items-center justify-center mx-auto mb-4">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1.5">No Final Synthesis Report Available</h3>
        <p className="text-xs text-forge-400">
          The final verification synthesis report will be compiled automatically once the test suite passes or execution concludes.
        </p>
      </div>
    );
  }

  const handleDownloadPatch = () => {
    window.open(`/api/tasks/${task.id}/download`, "_blank");
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto overflow-y-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/20 to-forge-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              Verification Complete
            </span>
            {report.isMock && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Mock Mode
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-white">Evidence-Backed Verification Synthesis</h2>
          <p className="text-xs text-forge-300 mt-1 max-w-xl">
            {report.summary}
          </p>
        </div>

        <button
          onClick={handleDownloadPatch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-forge-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          Export .patch
        </button>
      </div>

      {/* Verified Results Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Verified Results & Passing Behaviors ({report.verifiedResults.length})
        </h3>
        <div className="space-y-2">
          {report.verifiedResults.map((result, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-emerald-950/10 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{result}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Failed Checks (if any) */}
      {report.failedChecks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            Remaining Failed Checks ({report.failedChecks.length})
          </h3>
          <div className="space-y-2">
            {report.failedChecks.map((check, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5"
              >
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skipped Checks & Assumptions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Skipped Checks */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-forge-400 font-mono flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Skipped Checks ({report.skippedChecks.length})
          </h3>
          <div className="space-y-2">
            {report.skippedChecks.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-forge-900/60 border border-forge-800 text-xs text-forge-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Assumptions */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-forge-400 font-mono flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Explicit Assumptions ({report.assumptions.length})
          </h3>
          <div className="space-y-2">
            {report.assumptions.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-forge-900/60 border border-forge-800 text-xs text-forge-300"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metadata & Audit Footer */}
      <div className="p-4 rounded-lg bg-forge-950 border border-forge-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-forge-400">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Inference Model: <strong className="text-white">{report.modelUsed}</strong></span>
        </div>
        <div>
          Repair Cycles: <strong className="text-white">{report.repairsNeeded}</strong>
        </div>
        <div>
          Total Verified In: <strong className="text-white">{report.totalDurationMs}ms</strong>
        </div>
      </div>
    </div>
  );
};
