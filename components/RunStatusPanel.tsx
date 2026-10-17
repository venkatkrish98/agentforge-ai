"use client";

import React from "react";
import { Task } from "@/lib/types/task";
import { StatusBadge } from "./StatusBadge";
import {
  ShieldAlert,
  RotateCcw,
  Cpu,
  Check,
  X,
  Play,
  Terminal,
  Activity,
  Layers,
  Lock
} from "lucide-react";

interface RunStatusPanelProps {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
  onRunPlan: () => void;
  isProcessing: boolean;
}

export const RunStatusPanel: React.FC<RunStatusPanelProps> = ({
  task,
  onApprove,
  onReject,
  onRunPlan,
  isProcessing
}) => {
  const latestRun = task.testRuns[task.testRuns.length - 1];

  return (
    <aside className="w-80 border-l border-forge-800 bg-forge-900/50 flex flex-col h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto p-4 space-y-4">
      {/* Task State Card */}
      <div className="p-3.5 rounded-lg bg-forge-900/80 border border-forge-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-forge-400">Task State</span>
          <StatusBadge status={task.status} size="sm" />
        </div>

        <div className="text-xs text-forge-200 font-mono">
          {task.status === "awaiting_approval"
            ? "Waiting for human sign-off on diff."
            : task.status === "running_tests"
            ? "Executing test suite in isolated workspace."
            : task.status === "repairing"
            ? `Repair iteration #${task.currentRepairAttempt} in progress.`
            : task.status === "success"
            ? "All test assertions verified."
            : task.status === "failed"
            ? "Test repairs unresolved."
            : "Workspace idle."}
        </div>

        {task.status === "idle" && (
          <button
            onClick={onRunPlan}
            disabled={isProcessing}
            className="w-full mt-2 py-2 px-3 rounded-md bg-cyan-500 hover:bg-cyan-400 text-forge-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            {isProcessing ? "Processing..." : "Start Agent Run"}
          </button>
        )}
      </div>

      {/* Human Approval Gate Card (Visible when awaiting approval) */}
      {task.status === "awaiting_approval" && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <h4 className="text-xs font-semibold text-white">Approval Gate Active</h4>
          </div>
          <p className="text-[11px] text-forge-300 leading-relaxed">
            {task.proposedChanges.length} file(s) modified. Review diffs and grant permission to apply changes and run tests.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="py-1.5 px-2 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
            <button
              onClick={onApprove}
              disabled={isProcessing}
              className="py-1.5 px-2 rounded bg-emerald-500 hover:bg-emerald-400 text-forge-950 text-xs font-semibold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1 transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </button>
          </div>
        </div>
      )}

      {/* Repair Loop Telemetry */}
      <div className="p-3.5 rounded-lg bg-forge-900/80 border border-forge-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-forge-400 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            Repair Loop Monitor
          </span>
          <span className="text-xs font-mono font-bold text-white">
            {task.currentRepairAttempt} / {task.maxRepairAttempts}
          </span>
        </div>

        <div className="w-full bg-forge-950 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-cyan-500 h-full transition-all duration-300"
            style={{ width: `${(task.currentRepairAttempt / task.maxRepairAttempts) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-forge-400 pt-1">
          <span>Loop Detector:</span>
          <span className="text-emerald-400">Armed (SHA-256)</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-forge-400">
          <span>Repair History:</span>
          <span>{task.repairHistory.length} attempt(s)</span>
        </div>
      </div>

      {/* Process Execution Guardrails */}
      <div className="p-3.5 rounded-lg bg-forge-900/80 border border-forge-800 space-y-2 text-xs">
        <span className="text-[11px] font-mono uppercase tracking-wider text-forge-400 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          Process Execution Guardrails
        </span>

        <div className="space-y-1.5 text-[11px] font-mono text-forge-300">
          <div className="flex items-center justify-between">
            <span className="text-forge-400">Isolation:</span>
            <span className="text-amber-400">Host Subprocess (No Container)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-forge-400">Command Allowlist:</span>
            <span className="text-emerald-400">Strict Allowlist</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-forge-400">Execution Timeout:</span>
            <span>15,000ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-forge-400">Path Containment:</span>
            <span className="text-emerald-400">Separator & Symlink Guard</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-forge-400">Secret Redaction:</span>
            <span className="text-emerald-400">Env Purged</span>
          </div>
        </div>
        <div className="text-[10px] text-forge-500 pt-1 border-t border-forge-800/60 leading-tight">
          Execution restricted to verified sample projects. Untrusted repos require container sandboxing.
        </div>
      </div>

      {/* Model & Provider Telemetry */}
      <div className="p-3.5 rounded-lg bg-forge-900/80 border border-forge-800 space-y-2 text-xs">
        <span className="text-[11px] font-mono uppercase tracking-wider text-forge-400 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          Inference Engine
        </span>

        <div className="space-y-1 text-[11px] font-mono text-forge-300">
          <div className="text-white font-semibold truncate">{task.modelId}</div>
          <div className="text-forge-400">Platform: Nebius Token Factory</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            {task.isMockMode ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Mock / Simulated Mode
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Model Inference
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Latest Test Result Mini-Card */}
      {latestRun && (
        <div className="p-3.5 rounded-lg bg-forge-950 border border-forge-800 space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-forge-400">Latest Test Run</span>
            <span className={latestRun.passed ? "text-emerald-400" : "text-rose-400"}>
              {latestRun.passed ? "PASS" : "FAIL"}
            </span>
          </div>
          <div className="text-forge-200">
            Passed: {latestRun.passedTests} / {latestRun.totalTests}
          </div>
          <div className="text-forge-500 text-[10px]">
            Duration: {latestRun.durationMs}ms
          </div>
        </div>
      )}
    </aside>
  );
};
