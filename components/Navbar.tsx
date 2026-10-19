"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, RotateCcw, ShieldCheck, Activity, Terminal, ExternalLink } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [modelStatus, setModelStatus] = useState<{
    provider: string;
    model: string;
    hasKey: boolean;
    latencyMs?: number;
    status: string;
  }>({
    provider: "Nebius Token Factory",
    model: "nvidia/Nemotron-3_5-Lightning",
    hasKey: true,
    status: "checking"
  });

  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        if (data) {
          setModelStatus({
            provider: data.provider || "Nebius Token Factory",
            model: data.defaultModel || "nvidia/Nemotron-3_5-Lightning",
            hasKey: data.hasApiKey || false,
            status: data.hasApiKey ? "ready" : "mock"
          });
        }
      } catch {
        setModelStatus((prev) => ({ ...prev, status: "error" }));
      }
    }
    checkStatus();
  }, []);

  const handleReset = async () => {
    if (!confirm("Reset all tasks to the sample demo projects?")) return;
    setIsResetting(true);
    try {
      await fetch("/api/tasks/reset", {
        method: "POST",
        headers: { "x-agentforge-request": "1" }
      });
      window.location.reload();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="border-b border-forge-800 bg-forge-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1700px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand & Hackathon Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white flex items-center gap-1.5">
                AgentForge <span className="text-cyan-400 font-mono text-xs uppercase px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60">AI</span>
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-forge-800">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-forge-800/80 text-forge-300 border border-forge-700/60 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Nebius × NVIDIA Global AI Hackathon
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pathname === "/"
                ? "bg-forge-800 text-white border border-forge-700"
                : "text-forge-400 hover:text-white hover:bg-forge-800/50"
            }`}
          >
            Workspace
          </Link>
          <Link
            href="/settings"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pathname === "/settings"
                ? "bg-forge-800 text-white border border-forge-700"
                : "text-forge-400 hover:text-white hover:bg-forge-800/50"
            }`}
          >
            Model & Settings
          </Link>
          <Link
            href="/architecture"
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pathname === "/architecture"
                ? "bg-forge-800 text-white border border-forge-700"
                : "text-forge-400 hover:text-white hover:bg-forge-800/50"
            }`}
          >
            Architecture
          </Link>
        </nav>

        {/* Model Live Indicator & Actions */}
        <div className="flex items-center gap-3">
          {/* Active Model Pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-forge-950 border border-forge-800 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-forge-300 truncate max-w-[180px]">
              {modelStatus.model.replace("nvidia/", "")}
            </span>
            {modelStatus.status === "ready" ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Configured
              </span>
            ) : modelStatus.status === "connected" ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {modelStatus.latencyMs ? `${modelStatus.latencyMs}ms` : "Live"}
              </span>
            ) : modelStatus.status === "mock" ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">
                Mock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                Offline
              </span>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset to sample demo projects"
            className="p-1.5 text-forge-400 hover:text-white hover:bg-forge-800 rounded-md transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
