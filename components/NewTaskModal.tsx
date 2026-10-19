"use client";

import React, { useState } from "react";
import { SAMPLE_PROJECTS, SampleProject } from "@/lib/sample-projects";
import { VERIFIED_NEBIUS_MODELS } from "@/lib/types/models";
import { X, Sparkles, FolderCode, Shield, Check, Info } from "lucide-react";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (taskId: string) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onTaskCreated }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("calc-vault");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("nvidia/Nemotron-3_5-Lightning");
  const [requireApproval, setRequireApproval] = useState<boolean>(true);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSample = SAMPLE_PROJECTS.find((p) => p.id === selectedProjectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const title = customTitle.trim() || currentSample?.defaultTaskTitle || "Custom Coding Task";
    const taskDescription =
      customDescription.trim() || currentSample?.defaultTaskDescription || "Analyze codebase and repair failing test cases.";

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-agentforge-request": "1"
        },
        body: JSON.stringify({
          title,
          taskDescription,
          projectId: selectedProjectId,
          modelId: selectedModel,
          requireApprovalForChanges: requireApproval,
          maxRepairAttempts: 3,
          isMockMode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create task");
      }

      onTaskCreated(data.task.id);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-forge-900 border border-forge-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-forge-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Create New Coding & Repair Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-forge-400 hover:text-white hover:bg-forge-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-md">
              {error}
            </div>
          )}

          {/* Sample Project Selector */}
          <div>
            <label className="block text-xs font-medium text-forge-300 mb-2">
              Select Sample Project or Workspace Context
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_PROJECTS.map((project) => {
                const isSelected = selectedProjectId === project.id;
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setCustomTitle(project.defaultTaskTitle);
                      setCustomDescription(project.defaultTaskDescription);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-950/50"
                        : "bg-forge-850 border-forge-800 text-forge-400 hover:border-forge-700 hover:text-forge-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <FolderCode className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-forge-500"}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className="text-xs font-semibold text-white truncate">{project.name.split(" ")[0]}</div>
                    <div className="text-[10px] text-forge-400 mt-1 line-clamp-2">{project.category}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-medium text-forge-300 mb-1.5">Task Title</label>
            <input
              type="text"
              value={customTitle || currentSample?.defaultTaskTitle || ""}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Repair zero-division error and compound interest exponent"
              className="w-full px-3 py-2 bg-forge-950 border border-forge-800 rounded-md text-xs text-white placeholder-forge-600 focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs font-medium text-forge-300 mb-1.5">Task Objective & Failure Details</label>
            <textarea
              rows={4}
              value={customDescription || currentSample?.defaultTaskDescription || ""}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Describe the bug, unit test assertions that must pass, or refactoring goal..."
              className="w-full px-3 py-2 bg-forge-950 border border-forge-800 rounded-md text-xs text-white placeholder-forge-600 focus:border-cyan-500 transition-colors font-mono"
              required
            />
          </div>

          {/* Model Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-forge-300 mb-1.5">NVIDIA Model (Nebius Token Factory)</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 bg-forge-950 border border-forge-800 rounded-md text-xs text-white focus:border-cyan-500 transition-colors"
              >
                {VERIFIED_NEBIUS_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.isRecommended ? "(Recommended)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Command Info */}
            <div>
              <label className="block text-xs font-medium text-forge-300 mb-1.5">Configured Test Command</label>
              <div className="px-3 py-2 bg-forge-950 border border-forge-800 rounded-md text-xs font-mono text-cyan-400">
                {currentSample?.testCommand || "node --test"}
              </div>
            </div>
          </div>

          {/* Security & Execution Switches */}
          <div className="p-3 bg-forge-950 border border-forge-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-medium text-white">Require Human Approval Before Changes</div>
                  <div className="text-[11px] text-forge-400">Pause for side-by-side diff review before applying code to workspace.</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="w-4 h-4 rounded border-forge-700 text-cyan-500 focus:ring-cyan-500 bg-forge-900"
              />
            </div>

            <div className="flex items-center justify-between border-t border-forge-850 pt-2.5">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-xs font-medium text-white">Run in Honest Mock Mode</div>
                  <div className="text-[11px] text-forge-400">Simulate inference locally without live Nebius API calls.</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isMockMode}
                onChange={(e) => setIsMockMode(e.target.checked)}
                className="w-4 h-4 rounded border-forge-700 text-purple-500 focus:ring-purple-500 bg-forge-900"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-forge-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-medium text-forge-400 hover:text-white hover:bg-forge-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-forge-950 shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? "Creating..." : "Initialize Workspace Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
