"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { VERIFIED_NEBIUS_MODELS, ModelInfo, ConnectionTestResult } from "@/lib/types/models";
import { Cpu, ShieldCheck, CheckCircle2, XCircle, Clock, Zap, Key, ExternalLink, RefreshCw, Server } from "lucide-react";

export default function SettingsPage() {
  const [modelConfig, setModelConfig] = useState<{
    provider: string;
    baseUrl: string;
    defaultModel: string;
    hasApiKey: boolean;
    maskedApiKey: string;
    verifiedModels: ModelInfo[];
  } | null>(null);

  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedModelForTest, setSelectedModelForTest] = useState("nvidia/Nemotron-3_5-Lightning");

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        setModelConfig(data);
      } catch (err) {
        console.error("Failed loading model config:", err);
      }
    }
    loadConfig();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await fetch("/api/models/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: selectedModelForTest })
      });
      const data = await res.json();
      setTestResult(data.result);
    } catch (err: any) {
      setTestResult({
        status: "error",
        provider: "Nebius Token Factory",
        model: selectedModelForTest,
        latencyMs: 0,
        message: err.message || "Failed to contact local test endpoint",
        hasValidApiKey: false,
        timestamp: Date.now()
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-forge-950">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Model Provider & Token Factory Configuration
          </h1>
          <p className="text-xs text-forge-400 mt-1">
            Nebius Token Factory integration configuration, live latency testing, and NVIDIA open-model catalog.
          </p>
        </div>

        {/* Live Connection Test Card */}
        <div className="p-5 rounded-xl bg-forge-900 border border-forge-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Live Connection Diagnostic
              </h2>
              <p className="text-xs text-forge-400 mt-0.5">
                Send a non-destructive verification ping to Nebius Token Factory to measure latency and test authentication.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedModelForTest}
                onChange={(e) => setSelectedModelForTest(e.target.value)}
                className="px-3 py-1.5 bg-forge-950 border border-forge-800 rounded-md text-xs font-mono text-white focus:border-cyan-500"
              >
                {VERIFIED_NEBIUS_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-1.5 rounded-md text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-forge-950 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                {isTesting ? "Testing Ping..." : "Test Connection"}
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-lg border font-mono text-xs space-y-2 animate-in fade-in ${
                testResult.status === "connected"
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                  : testResult.status === "mock"
                  ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                  : "bg-rose-950/20 border-rose-500/30 text-rose-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.status === "connected" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Nebius Connection Healthy</span>
                    </>
                  ) : testResult.status === "mock" ? (
                    <>
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Mock Mode Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Connection Error</span>
                    </>
                  )}
                </div>

                <div className="text-[11px] text-forge-400">
                  Latency: <strong className="text-white">{testResult.latencyMs}ms</strong>
                </div>
              </div>

              <p className="text-xs leading-relaxed font-sans text-forge-300">
                {testResult.message}
              </p>

              {testResult.availableModelsCount !== undefined && (
                <div className="text-[11px] text-forge-400 pt-1 border-t border-forge-800/40">
                  Total Models Verified on Live Account: <strong className="text-cyan-400">{testResult.availableModelsCount} models</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security & Credentials Details */}
        <div className="p-5 rounded-xl bg-forge-900 border border-forge-800 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Security & Zero-Leakage Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-forge-950 border border-forge-800 space-y-2">
              <div className="text-[11px] font-mono text-forge-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                API Base Endpoint
              </div>
              <div className="text-xs font-mono text-white break-all">
                {modelConfig?.baseUrl || "https://api.tokenfactory.nebius.com/v1/"}
              </div>
              <p className="text-[11px] text-forge-400">
                Standard OpenAI-compatible completions endpoint served by Nebius high-performance CUDA cluster.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-forge-950 border border-forge-800 space-y-2">
              <div className="text-[11px] font-mono text-forge-400 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Server-Side Secret Isolation
              </div>
              <div className="text-xs font-mono text-white flex items-center justify-between">
                <span>Key Mask:</span>
                <span className="text-cyan-400">{modelConfig?.maskedApiKey || "••••••••••••"}</span>
              </div>
              <p className="text-[11px] text-forge-400">
                Loaded exclusively in server runtime via <code className="text-cyan-300">process.env.NEBIUS_API_KEY</code>. Never bundled into browser assets or child subprocesses.
              </p>
            </div>
          </div>
        </div>

        {/* Verified Models Catalog */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Verified NVIDIA Models Catalog</h2>
              <p className="text-xs text-forge-400">
                All models below are verified on Nebius Token Factory for coding agent workflows.
              </p>
            </div>
            <a
              href="https://tokenfactory.nebius.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              Token Factory Catalog
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VERIFIED_NEBIUS_MODELS.map((model) => (
              <div
                key={model.id}
                className="p-4 rounded-xl bg-forge-900 border border-forge-800 hover:border-forge-700 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">{model.name}</h3>
                      {model.isRecommended && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{model.id}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Verified
                  </span>
                </div>

                <p className="text-xs text-forge-300 leading-relaxed">
                  {model.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-forge-400 pt-2 border-t border-forge-800/80">
                  <span>Context: {(model.contextWindow / 1024).toFixed(0)}k tokens</span>
                  <span>Max Out: {model.maxTokens} tokens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
