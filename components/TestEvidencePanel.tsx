"use client";

import React, { useState } from "react";
import { Task, TestRunResult } from "@/lib/types/task";
import { CheckCircle2, XCircle, Terminal, Clock, Copy, CheckCheck, AlertTriangle } from "lucide-react";

interface TestEvidencePanelProps {
  task: Task;
}

export const TestEvidencePanel: React.FC<TestEvidencePanelProps> = ({ task }) => {
  const [selectedRunIndex, setSelectedRunIndex] = useState(
    Math.max(0, task.testRuns.length - 1)
  );
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"assertions" | "stdout" | "stderr">("assertions");

  if (task.testRuns.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-forge-850 border border-forge-800 text-forge-400 flex items-center justify-center mx-auto mb-4">
          <Terminal className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1.5">No Test Runs Executed Yet</h3>
        <p className="text-xs text-forge-400">
          Once changes are approved, AgentForge will execute the permitted test suite in an isolated sandbox and display real test evidence and logs here.
        </p>
      </div>
    );
  }

  const currentRun: TestRunResult = task.testRuns[selectedRunIndex] || task.testRuns[task.testRuns.length - 1];

  const handleCopyLogs = () => {
    const text = `--- STDOUT ---\n${currentRun.stdout}\n\n--- STDERR ---\n${currentRun.stderr}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Test Run History Selector */}
      <div className="p-3 border-b border-forge-800 bg-forge-900/60 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-forge-400">Runs:</span>
          {task.testRuns.map((run, idx) => {
            const isSelected = idx === selectedRunIndex;
            return (
              <button
                key={run.id || idx}
                onClick={() => setSelectedRunIndex(idx)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? "bg-forge-800 text-white border border-cyan-500/60"
                    : "text-forge-400 hover:text-white hover:bg-forge-800/40"
                }`}
              >
                {run.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>Run #{idx + 1}</span>
                <span className="text-[10px] text-forge-500">({run.passedTests}/{run.totalTests})</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleCopyLogs}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono text-forge-300 hover:text-white hover:bg-forge-800 transition-colors"
        >
          {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          Copy Full Logs
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-forge-950/50 border-b border-forge-800">
        <div className="p-2.5 rounded-lg bg-forge-900/60 border border-forge-800">
          <div className="text-[10px] uppercase font-mono text-forge-400">Exit Code</div>
          <div className={`text-base font-bold font-mono mt-0.5 ${currentRun.exitCode === 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {currentRun.exitCode} {currentRun.exitCode === 0 ? "(SUCCESS)" : "(FAILED)"}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-forge-900/60 border border-forge-800">
          <div className="text-[10px] uppercase font-mono text-forge-400">Duration</div>
          <div className="text-base font-bold font-mono text-white mt-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-forge-400" />
            {currentRun.durationMs}ms
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-forge-900/60 border border-forge-800">
          <div className="text-[10px] uppercase font-mono text-forge-400">Passed Assertions</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
            {currentRun.passedTests} / {currentRun.totalTests}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-forge-900/60 border border-forge-800">
          <div className="text-[10px] uppercase font-mono text-forge-400">Failed Assertions</div>
          <div className={`text-base font-bold font-mono mt-0.5 ${currentRun.failedTests === 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {currentRun.failedTests}
          </div>
        </div>
      </div>

      {/* View Switcher: Assertions vs Raw Logs */}
      <div className="flex border-b border-forge-800 bg-forge-900/40 px-4">
        <button
          onClick={() => setActiveTab("assertions")}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "assertions"
              ? "border-cyan-500 text-white"
              : "border-transparent text-forge-400 hover:text-white"
          }`}
        >
          Parsed Assertions ({currentRun.assertions.length})
        </button>
        <button
          onClick={() => setActiveTab("stdout")}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "stdout"
              ? "border-cyan-500 text-white"
              : "border-transparent text-forge-400 hover:text-white"
          }`}
        >
          Stdout Log
        </button>
        <button
          onClick={() => setActiveTab("stderr")}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "stderr"
              ? "border-cyan-500 text-white"
              : "border-transparent text-forge-400 hover:text-white"
          }`}
        >
          Stderr Log {currentRun.stderr ? "(Has Output)" : ""}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 bg-[#070b12]">
        {activeTab === "assertions" && (
          <div className="space-y-2">
            {currentRun.assertions.length === 0 ? (
              <div className="p-4 text-xs font-mono text-forge-400 bg-forge-900/40 rounded-lg">
                No specific assertion lines matched parser pattern. Inspect stdout below.
              </div>
            ) : (
              currentRun.assertions.map((assertion, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border font-mono text-xs flex flex-col gap-1.5 ${
                    assertion.passed
                      ? "bg-emerald-950/15 border-emerald-900/40 text-emerald-200"
                      : "bg-rose-950/20 border-rose-900/50 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {assertion.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-semibold">{assertion.title}</span>
                  </div>
                  {assertion.error && (
                    <div className="pl-6 text-[11px] text-rose-300/90 font-mono bg-rose-950/30 p-2 rounded border border-rose-900/30">
                      {assertion.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "stdout" && (
          <pre className="p-4 rounded-lg bg-forge-950 border border-forge-800 text-xs font-mono text-forge-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {currentRun.stdout || "# (No stdout output captured)"}
          </pre>
        )}

        {activeTab === "stderr" && (
          <pre className="p-4 rounded-lg bg-forge-950 border border-forge-800 text-xs font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {currentRun.stderr || "# (No stderr output captured)"}
          </pre>
        )}
      </div>
    </div>
  );
};
