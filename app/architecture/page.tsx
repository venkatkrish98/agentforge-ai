"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { ShieldCheck, Cpu, Terminal, RotateCcw, Lock, Layers, CheckCircle2, GitBranch, AlertTriangle } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="flex flex-col min-h-screen bg-forge-950">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Technical Architecture & Threat Model
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AgentForge AI Systems Architecture
          </h1>
          <p className="text-xs text-forge-400 mt-1 max-w-2xl leading-relaxed">
            Engineered for the Nebius × NVIDIA Global AI Hackathon. High-performance autonomous coding, test-repair, and evidence verification powered by NVIDIA Nemotron on Nebius Token Factory.
          </p>
        </div>

        {/* Core Differentiation Banner */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-forge-900 border border-cyan-500/30 space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            Core Differentiation: Task-to-Code & Evidence-Backed Repair vs. Static Code Review
          </h2>
          <p className="text-xs text-forge-300 leading-relaxed">
            Generic AI developer tools merely generate speculative code comments or summarize pull requests. <strong>AgentForge AI</strong> is an active engineering agent: it formulates step plans, writes real source code, runs genuine unit tests in an isolated sandbox, reads actual stdout/stderr and exit codes, diagnoses assertion failures, and executes bounded iterative repairs until the software passes verification.
          </p>
        </div>

        {/* 6-Stage Autonomous Loop */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-forge-400 font-mono">
            The 6-Stage Autonomous Engineering Loop
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-forge-900 border border-forge-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
                1
              </div>
              <h3 className="text-xs font-bold text-white">Context & Task Ingestion</h3>
              <p className="text-[11px] text-forge-300 leading-relaxed">
                Reads task objective and target repository files into a typed context payload. Sanitizes inputs and validates file path safety.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-forge-900 border border-forge-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-mono text-xs font-bold text-purple-400">
                2
              </div>
              <h3 className="text-xs font-bold text-white">NVIDIA Nemotron Planning</h3>
              <p className="text-[11px] text-forge-300 leading-relaxed">
                Nebius Token Factory routes the prompt to high-speed hybrid MoE models (e.g. Nemotron 3.5 Lightning) to formulate a structured multi-phase plan.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-forge-900 border border-forge-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono text-xs font-bold text-amber-400">
                3
              </div>
              <h3 className="text-xs font-bold text-white">Human Approval Gate</h3>
              <p className="text-[11px] text-forge-300 leading-relaxed">
                Before any file is modified or process spawned, a visual unified diff is generated. The human engineer reviews and authorizes execution.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-forge-900 border border-forge-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-mono text-xs font-bold text-blue-400">
                4
              </div>
              <h3 className="text-xs font-bold text-white">Isolated Sandbox Test Runner</h3>
              <p className="text-[11px] text-forge-300 leading-relaxed">
                Executes permitted test commands in an isolated directory. Environment variables are sanitized (API keys stripped), timeout enforced at 15s.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-forge-900 border border-forge-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold text-emerald-400">
                5
              </div>
              <h3 className="text-xs font-bold text-white">Bounded Iterative Repair</h3>
              <p className="text-[11px] text-forge-300 leading-relaxed">
                If assertions fail, the model inspects real stdout/stderr to diagnose root causes. Bounded max attempts and SHA-256 loop detection prevent infinite cycles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-forge-900 border border-forge-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
                6
              </div>
              <h3 className="text-xs font-bold text-white">Evidence Synthesis & Export</h3>
              <p className="text-[11px] text-forge-300 leading-relaxed">
                Compiles itemized checklist of verified passing tests, duration, assumptions, and generates downloadable standardized <code className="text-cyan-300">.patch</code> files.
              </p>
            </div>
          </div>
        </div>

        {/* Threat Model & Security Posture */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-forge-400 font-mono flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Threat Model & Defenses
          </h2>

          <div className="p-5 rounded-xl bg-forge-900 border border-forge-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Prompt Injection Isolation
                </div>
                <p className="text-[11px] text-forge-300 leading-relaxed">
                  Repository contents, code comments, and issue descriptions are treated strictly as untrusted string data within system prompts. The model is explicitly barred from executing instructions embedded in files.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Zero Secret Leakage
                </div>
                <p className="text-[11px] text-forge-300 leading-relaxed">
                  <code className="text-cyan-300">NEBIUS_API_KEY</code> and cloud credentials are kept exclusively in server memory. Subprocesses spawned for test execution have their environments stripped of all secret variables.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Strict Command Allowlist
                </div>
                <p className="text-[11px] text-forge-300 leading-relaxed">
                  Only non-destructive, verified test commands are permitted (<code className="text-cyan-300">node --test</code>, <code className="text-cyan-300">npm test</code>). Shell chaining (<code className="text-rose-400">; &amp; | ` $ &gt; &lt;</code>) is rejected by the validator.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Path Traversal & Device Name Guards
                </div>
                <p className="text-[11px] text-forge-300 leading-relaxed">
                  All target paths are validated to ensure they resolve strictly inside the workspace root. Traversal tokens (<code className="text-rose-400">../</code>) and reserved Windows device names are rejected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
