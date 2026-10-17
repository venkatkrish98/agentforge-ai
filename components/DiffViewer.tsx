"use client";

import React, { useState } from "react";
import { Task, FileChange } from "@/lib/types/task";
import { GitCompare, FileCode, Check, X, ShieldAlert, Download, Copy, CheckCheck } from "lucide-react";

interface DiffViewerProps {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ task, onApprove, onReject, isProcessing }) => {
  const changes: FileChange[] =
    task.appliedChanges.length > 0 ? task.appliedChanges : task.proposedChanges;

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (changes.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-forge-850 border border-forge-800 text-forge-400 flex items-center justify-center mx-auto mb-4">
          <GitCompare className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1.5">No Diffs Generated Yet</h3>
        <p className="text-xs text-forge-400">
          Once the agent completes plan synthesis, code modifications will appear here with an interactive line-by-line diff.
        </p>
      </div>
    );
  }

  const activeFile = changes[activeFileIndex] || changes[0];

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(activeFile.diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPatch = () => {
    window.open(`/api/tasks/${task.id}/download`, "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Approval Banner if waiting */}
      {task.status === "awaiting_approval" && (
        <div className="m-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Human Approval Gate Required</h4>
              <p className="text-xs text-forge-300">
                Agent proposed changes to <span className="font-mono text-cyan-400">{changes.length} file(s)</span>. Review the diff before modifications are written to disk and test runner executes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Reject & Abort
            </button>
            <button
              onClick={onApprove}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-forge-950 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {isProcessing ? "Executing..." : "Approve & Run Tests"}
            </button>
          </div>
        </div>
      )}

      {/* File Tabs & Actions Header */}
      <div className="px-4 py-2.5 border-b border-forge-800 bg-forge-900/60 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-0">
          {changes.map((file, idx) => {
            const isActive = idx === activeFileIndex;
            return (
              <button
                key={file.path}
                onClick={() => setActiveFileIndex(idx)}
                className={`px-3 py-1 rounded-md text-xs font-mono flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-forge-800 text-white border border-cyan-500/50"
                    : "text-forge-400 hover:text-white hover:bg-forge-800/40"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[200px]">{file.path}</span>
                <span className="text-[10px] text-emerald-400">+{file.additions}</span>
                <span className="text-[10px] text-rose-400">-{file.deletions}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyDiff}
            className="p-1.5 rounded text-forge-400 hover:text-white hover:bg-forge-800 transition-colors"
            title="Copy diff to clipboard"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownloadPatch}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-forge-800 hover:bg-forge-700 text-xs font-mono text-forge-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            .patch
          </button>
        </div>
      </div>

      {/* Diff Content Viewer */}
      <div className="flex-1 overflow-auto bg-[#070b12] p-4 font-mono text-xs leading-relaxed">
        <div className="rounded-lg border border-forge-800 overflow-hidden">
          <div className="bg-forge-900 px-3 py-1.5 border-b border-forge-800 flex items-center justify-between text-forge-400 text-[11px]">
            <span>{activeFile.path}</span>
            <div className="space-x-2">
              <span className="text-emerald-400 font-bold">+{activeFile.additions} lines</span>
              <span className="text-rose-400 font-bold">-{activeFile.deletions} lines</span>
            </div>
          </div>

          <pre className="p-3 overflow-x-auto text-forge-200 text-xs font-mono">
            {activeFile.diff.split("\n").map((line, i) => {
              let lineStyle = "";
              if (line.startsWith("+") && !line.startsWith("+++")) {
                lineStyle = "diff-line-add px-2 py-0.5 block";
              } else if (line.startsWith("-") && !line.startsWith("---")) {
                lineStyle = "diff-line-del px-2 py-0.5 block";
              } else if (line.startsWith("@@")) {
                lineStyle = "diff-line-header px-2 py-0.5 block font-bold";
              } else {
                lineStyle = "px-2 py-0.5 block text-forge-400";
              }

              return (
                <div key={i} className={lineStyle}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
};
