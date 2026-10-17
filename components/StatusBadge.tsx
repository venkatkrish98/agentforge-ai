import React from "react";
import { TaskStatus, PlanStepStatus } from "@/lib/types/task";
import { CheckCircle2, AlertCircle, Clock, PlayCircle, ShieldAlert, XCircle, RotateCcw } from "lucide-react";

interface StatusBadgeProps {
  status: TaskStatus | PlanStepStatus;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const isSm = size === "sm";
  const baseClasses = `inline-flex items-center gap-1.5 font-mono font-medium rounded-full ${
    isSm ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
  }`;

  switch (status) {
    case "success":
    case "completed":
      return (
        <span className={`${baseClasses} bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
          <CheckCircle2 className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          {status === "success" ? "All Tests Verified" : "Completed"}
        </span>
      );

    case "awaiting_approval":
      return (
        <span className={`${baseClasses} bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse`}>
          <ShieldAlert className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Awaiting Approval
        </span>
      );

    case "planning":
    case "analyzing":
      return (
        <span className={`${baseClasses} bg-cyan-500/10 text-cyan-400 border border-cyan-500/20`}>
          <PlayCircle className={isSm ? "w-3 h-3 animate-spin" : "w-3.5 h-3.5 animate-spin"} />
          Planning
        </span>
      );

    case "generating_code":
    case "applying_patch":
      return (
        <span className={`${baseClasses} bg-purple-500/10 text-purple-400 border border-purple-500/20`}>
          <PlayCircle className={isSm ? "w-3 h-3 animate-spin" : "w-3.5 h-3.5 animate-spin"} />
          Generating Patch
        </span>
      );

    case "running_tests":
      return (
        <span className={`${baseClasses} bg-blue-500/10 text-blue-400 border border-blue-500/20`}>
          <PlayCircle className={isSm ? "w-3 h-3 animate-spin" : "w-3.5 h-3.5 animate-spin"} />
          Running Tests
        </span>
      );

    case "repairing":
    case "analyzing_failure":
      return (
        <span className={`${baseClasses} bg-amber-500/15 text-amber-300 border border-amber-500/30`}>
          <RotateCcw className={isSm ? "w-3 h-3 animate-spin" : "w-3.5 h-3.5 animate-spin"} />
          Repairing Iteration
        </span>
      );

    case "failed":
      return (
        <span className={`${baseClasses} bg-rose-500/10 text-rose-400 border border-rose-500/20`}>
          <XCircle className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Failed
        </span>
      );

    case "cancelled":
      return (
        <span className={`${baseClasses} bg-slate-500/10 text-slate-400 border border-slate-500/20`}>
          <AlertCircle className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          Rejected / Cancelled
        </span>
      );

    case "in_progress":
      return (
        <span className={`${baseClasses} bg-blue-500/10 text-blue-400 border border-blue-500/20`}>
          <Clock className={isSm ? "w-3 h-3 animate-spin" : "w-3.5 h-3.5 animate-spin"} />
          In Progress
        </span>
      );

    case "pending":
    case "idle":
    default:
      return (
        <span className={`${baseClasses} bg-slate-800 text-slate-400 border border-slate-700`}>
          <Clock className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
          {status === "idle" ? "Ready" : "Pending"}
        </span>
      );
  }
};
