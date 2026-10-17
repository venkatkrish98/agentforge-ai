"use client";

import React, { useState } from "react";
import { AgentEvent } from "@/lib/types/task";
import {
  Activity,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  PlayCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Layers
} from "lucide-react";

interface EventTimelineProps {
  events: AgentEvent[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = events.filter((ev) => {
    if (filter === "all") return true;
    if (filter === "model") return ev.type.startsWith("model_");
    if (filter === "tests") return ev.type.startsWith("test_");
    if (filter === "approval") return ev.type.includes("approval");
    if (filter === "repairs") return ev.type.includes("repair") || ev.type.includes("diagnosed");
    return true;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case "model_call_start":
      case "model_call_success":
        return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
      case "approval_requested":
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      case "approval_granted":
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case "test_started":
      case "test_finished":
        return <PlayCircle className="w-3.5 h-3.5 text-blue-400" />;
      case "repair_attempted":
      case "failure_diagnosed":
        return <RotateCcw className="w-3.5 h-3.5 text-amber-300" />;
      case "task_completed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "task_failed":
      case "approval_rejected":
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Filter Tabs */}
      <div className="p-3 border-b border-forge-800 bg-forge-900/60 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-forge-400 mr-2">Filter:</span>
          {["all", "model", "tests", "approval", "repairs"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-colors ${
                filter === f
                  ? "bg-forge-800 text-white border border-cyan-500/50"
                  : "text-forge-400 hover:text-white hover:bg-forge-800/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-[11px] font-mono text-forge-500">{filteredEvents.length} Events</span>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-xs text-forge-500">
            No events recorded for current filter.
          </div>
        ) : (
          filteredEvents.map((ev, idx) => (
            <div
              key={ev.id || idx}
              className="p-3 rounded-lg bg-forge-900/60 border border-forge-800/80 hover:border-forge-700 transition-colors flex items-start gap-3"
            >
              <div className="p-1.5 rounded bg-forge-950 border border-forge-800 shrink-0 mt-0.5">
                {getEventIcon(ev.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                    {ev.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono text-forge-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-forge-300 leading-relaxed font-sans">
                  {ev.message}
                </p>

                {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                  <pre className="mt-2 p-2 rounded bg-forge-950 border border-forge-850 text-[10px] font-mono text-forge-400 overflow-x-auto">
                    {JSON.stringify(ev.metadata, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
