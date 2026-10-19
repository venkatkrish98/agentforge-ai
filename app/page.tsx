"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { TaskSidebar } from "@/components/TaskSidebar";
import { RunStatusPanel } from "@/components/RunStatusPanel";
import { PlanViewer } from "@/components/PlanViewer";
import { DiffViewer } from "@/components/DiffViewer";
import { TestEvidencePanel } from "@/components/TestEvidencePanel";
import { EventTimeline } from "@/components/EventTimeline";
import { FinalReportViewer } from "@/components/FinalReportViewer";
import { NewTaskModal } from "@/components/NewTaskModal";
import { StatusBadge } from "@/components/StatusBadge";
import { Task } from "@/lib/types/task";
import {
  ListOrdered,
  GitCompare,
  Terminal,
  Activity,
  FileCheck2,
  FolderGit2,
  Play,
  FileCode,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

type ActiveTab = "overview" | "plan" | "diff" | "tests" | "timeline" | "report";

export default function WorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        if (!activeTaskId && data.tasks.length > 0) {
          setActiveTaskId(data.tasks[0].id);
        }
      }
    } catch (err) {
      console.error("Failed fetching tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTaskId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Active task object
  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0] || null;

  // Polling for updates if active task is in an active transition state
  useEffect(() => {
    if (!activeTask) return;
    const isTransitional = [
      "planning",
      "generating_code",
      "applying_patch",
      "running_tests",
      "analyzing_failure",
      "repairing"
    ].includes(activeTask.status);

    if (!isTransitional) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tasks/${activeTask.id}`);
        const data = await res.json();
        if (data.task) {
          setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTask]);

  // Handle plan & code generation trigger
  const handleExecutePlan = async () => {
    if (!activeTask) return;
    setIsProcessing(true);
    setActiveTab("plan");
    try {
      const res = await fetch(`/api/tasks/${activeTask.id}/plan`, {
        method: "POST",
        headers: { "x-agentforge-request": "1" }
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
        if (data.task.status === "awaiting_approval") {
          setActiveTab("diff");
        }
      }
    } catch (err) {
      console.error("Execute plan error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle approval of proposed diff
  const handleApprove = async () => {
    if (!activeTask) return;
    setIsProcessing(true);
    setActiveTab("tests");
    try {
      const res = await fetch(`/api/tasks/${activeTask.id}/approve`, {
        method: "POST",
        headers: { "x-agentforge-request": "1" }
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
        if (data.task.status === "success") {
          setActiveTab("report");
        }
      }
    } catch (err) {
      console.error("Approval execution error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle rejection of proposed diff
  const handleReject = async () => {
    if (!activeTask) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/tasks/${activeTask.id}/reject`, {
        method: "POST",
        headers: { "x-agentforge-request": "1" }
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
      }
    } catch (err) {
      console.error("Rejection error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { "x-agentforge-request": "1" }
      });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (activeTaskId === taskId) {
        const remaining = tasks.filter((t) => t.id !== taskId);
        setActiveTaskId(remaining[0]?.id || null);
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-forge-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            Loading AgentForge Workspace...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-forge-950">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Task Sidebar */}
        <TaskSidebar
          tasks={tasks}
          activeTaskId={activeTaskId}
          onSelectTask={(id) => {
            setActiveTaskId(id);
            setActiveTab("overview");
            setSelectedFileForPreview(null);
          }}
          onOpenNewTaskModal={() => setIsModalOpen(true)}
          onDeleteTask={handleDeleteTask}
        />

        {/* Central Workspace Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-forge-950">
          {activeTask ? (
            <>
              {/* Workspace Header */}
              <div className="p-4 border-b border-forge-800 bg-forge-900/40 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FolderGit2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono text-forge-400">{activeTask.projectName}</span>
                      <span className="text-forge-600">•</span>
                      <span className="text-xs font-mono text-forge-500">ID: {activeTask.id.substring(0, 14)}</span>
                      {activeTask.isMockMode && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Mock Mode
                        </span>
                      )}
                    </div>
                    <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {activeTask.title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={activeTask.status} />

                    {activeTask.status === "idle" && (
                      <button
                        onClick={handleExecutePlan}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-forge-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Start Repair Run
                      </button>
                    )}
                  </div>
                </div>

                {/* Workspace Navigation Tabs */}
                <div className="flex items-center gap-1 mt-4 border-b border-forge-800/80 -mb-4 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "overview"
                        ? "border-cyan-500 text-white"
                        : "border-transparent text-forge-400 hover:text-white"
                    }`}
                  >
                    <FolderGit2 className="w-3.5 h-3.5" />
                    Overview
                  </button>

                  <button
                    onClick={() => setActiveTab("plan")}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "plan"
                        ? "border-cyan-500 text-white"
                        : "border-transparent text-forge-400 hover:text-white"
                    }`}
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    Plan {activeTask.plan.length > 0 && `(${activeTask.plan.length})`}
                  </button>

                  <button
                    onClick={() => setActiveTab("diff")}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "diff"
                        ? "border-cyan-500 text-white"
                        : "border-transparent text-forge-400 hover:text-white"
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    Code Diff
                    {(activeTask.proposedChanges.length > 0 || activeTask.appliedChanges.length > 0) && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("tests")}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "tests"
                        ? "border-cyan-500 text-white"
                        : "border-transparent text-forge-400 hover:text-white"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    Tests & Evidence
                    {activeTask.testRuns.length > 0 && (
                      <span className="text-[10px] font-mono px-1 rounded bg-forge-800 text-forge-300">
                        {activeTask.testRuns.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "timeline"
                        ? "border-cyan-500 text-white"
                        : "border-transparent text-forge-400 hover:text-white"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Timeline ({activeTask.events.length})
                  </button>

                  <button
                    onClick={() => setActiveTab("report")}
                    className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "report"
                        ? "border-cyan-500 text-white"
                        : "border-transparent text-forge-400 hover:text-white"
                    }`}
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Final Report
                    {activeTask.finalReport && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-auto">
                {activeTab === "overview" && (
                  <div className="p-6 space-y-6 max-w-4xl">
                    {/* Task Description */}
                    <div className="p-4 rounded-lg bg-forge-900/60 border border-forge-800 space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-forge-400 font-mono">
                        Task Objective
                      </h3>
                      <p className="text-xs text-forge-200 leading-relaxed font-mono whitespace-pre-wrap">
                        {activeTask.taskDescription}
                      </p>
                    </div>

                    {/* Repository Files */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-forge-400 font-mono">
                          Target Project Context ({activeTask.files.length} Files)
                        </h3>
                        <span className="text-[11px] font-mono text-cyan-400">
                          Isolated in workspace-data/runs/
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {activeTask.files.map((file) => {
                          const isSelected = selectedFileForPreview === file.path;
                          return (
                            <button
                              key={file.path}
                              onClick={() => setSelectedFileForPreview(file.path)}
                              className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                                isSelected
                                  ? "bg-forge-800 border-cyan-500 text-white"
                                  : "bg-forge-900/40 border-forge-800 text-forge-300 hover:bg-forge-850 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <FileCode className="w-4 h-4 text-cyan-400" />
                                <span className="font-semibold truncate">{file.path}</span>
                              </div>
                              <span className="text-[10px] text-forge-500">
                                {file.content.length} bytes
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* File preview if clicked */}
                      {selectedFileForPreview && (
                        <div className="mt-4 rounded-lg border border-forge-800 overflow-hidden animate-in fade-in">
                          <div className="bg-forge-900 px-3 py-1.5 border-b border-forge-800 text-xs font-mono text-forge-400 flex items-center justify-between">
                            <span>Preview: {selectedFileForPreview}</span>
                            <button
                              onClick={() => setSelectedFileForPreview(null)}
                              className="text-forge-500 hover:text-white"
                            >
                              Close Preview
                            </button>
                          </div>
                          <pre className="p-4 bg-[#070b12] text-xs font-mono text-forge-300 overflow-x-auto max-h-80">
                            {activeTask.files.find((f) => f.path === selectedFileForPreview)?.content}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "plan" && (
                  <PlanViewer
                    task={activeTask}
                    onExecutePlan={handleExecutePlan}
                    isExecuting={isProcessing}
                  />
                )}

                {activeTab === "diff" && (
                  <DiffViewer
                    task={activeTask}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isProcessing={isProcessing}
                  />
                )}

                {activeTab === "tests" && <TestEvidencePanel task={activeTask} />}

                {activeTab === "timeline" && <EventTimeline events={activeTask.events} />}

                {activeTab === "report" && <FinalReportViewer task={activeTask} />}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <FolderGit2 className="w-12 h-12 text-forge-600 mb-4" />
              <h3 className="text-base font-semibold text-white mb-2">No Task Selected</h3>
              <p className="text-xs text-forge-400 max-w-sm mb-6">
                Select an existing task from the sidebar or initialize a new coding repair task to begin.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-forge-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
              >
                Create New Task
              </button>
            </div>
          )}
        </main>

        {/* Right Run & Security Status Panel */}
        {activeTask && (
          <RunStatusPanel
            task={activeTask}
            onApprove={handleApprove}
            onReject={handleReject}
            onRunPlan={handleExecutePlan}
            isProcessing={isProcessing}
          />
        )}
      </div>

      {/* New Task Dialog Modal */}
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={(newTaskId) => {
          fetchTasks();
          setActiveTaskId(newTaskId);
          setActiveTab("overview");
        }}
      />
    </div>
  );
}
