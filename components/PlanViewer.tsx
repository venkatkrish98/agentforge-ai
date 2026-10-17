"use client";

import React from "react";
import { Task, PlanStep } from "@/lib/types/task";
import { StatusBadge } from "./StatusBadge";
import { ListOrdered, CheckCircle2, Circle, Clock, ArrowRight, Play, Sparkles } from "lucide-react";

interface PlanViewerProps {
  task: Task;
  onExecutePlan: () => void;
  isExecuting: boolean;
}

export const PlanViewer: React.FC<PlanViewerProps> = ({ task, onExecutePlan, isExecuting }) => {
  if (task.plan.length === 0) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 flex items-center justify-center mx-auto mb-4">
          <ListOrdered className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1.5">No Structured Plan Generated Yet</h3>
        <p className="text-xs text-forge-400 mb-6">
          Instruct AgentForge to inspect the project repository, analyze test requirements, and synthesize a multi-phase repair plan.
        </p>
        <button
          onClick={onExecutePlan}
          disabled={isExecuting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-forge-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isExecuting ? "Synthesizing Plan with Nemotron..." : "Analyze & Generate Plan"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-forge-800">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-forge-400 font-mono">
            Autonomous Execution Plan ({task.plan.length} Phases)
          </h3>
          <p className="text-xs text-forge-300 mt-0.5">
            Structured steps formulated by {task.modelId} {task.isMockMode ? "[Mock Mode]" : ""}
          </p>
        </div>

        {task.status === "idle" && (
          <button
            onClick={onExecutePlan}
            disabled={isExecuting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-forge-950 font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {isExecuting ? "Executing..." : "Run Plan"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {task.plan.map((step, idx) => {
          const isDone = step.status === "completed";
          const isInProgress = step.status === "in_progress";
          const isFailed = step.status === "failed";

          return (
            <div
              key={step.id || idx}
              className={`p-4 rounded-lg border transition-all ${
                isInProgress
                  ? "bg-forge-850 border-cyan-500/60 shadow-md shadow-cyan-950/40"
                  : isDone
                  ? "bg-forge-900/60 border-forge-800/80"
                  : isFailed
                  ? "bg-rose-950/20 border-rose-800/60"
                  : "bg-forge-900/30 border-forge-800/40 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isDone
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : isInProgress
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse"
                        : isFailed
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-forge-800 text-forge-400 border border-forge-700"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{step.title}</h4>
                    <span className="text-[10px] font-mono text-forge-500 uppercase tracking-wider">
                      {step.actionType.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <StatusBadge status={step.status} size="sm" />
              </div>

              <p className="text-xs text-forge-300 pl-8 leading-relaxed">
                {step.description}
              </p>

              {step.output && (
                <div className="mt-3 ml-8 p-2.5 rounded bg-forge-950 border border-forge-800 font-mono text-[11px] text-forge-300 overflow-x-auto">
                  {step.output}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
