"use client";

import React, { useState } from "react";
import { Task } from "@/lib/types/task";
import { StatusBadge } from "./StatusBadge";
import { Plus, Search, FolderGit2, Trash2 } from "lucide-react";

interface TaskSidebarProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onOpenNewTaskModal: () => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  tasks,
  activeTaskId,
  onSelectTask,
  onOpenNewTaskModal,
  onDeleteTask
}) => {
  const [search, setSearch] = useState("");

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-forge-800 bg-forge-900/50 flex flex-col h-[calc(100vh-3.5rem)] shrink-0">
      {/* Header & New Task Button */}
      <div className="p-3 border-b border-forge-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-forge-400 font-mono">
            Workspaces ({tasks.length})
          </span>
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-cyan-500 hover:bg-cyan-400 text-forge-950 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-forge-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tasks..."
            className="w-full pl-8 pr-3 py-1.5 bg-forge-950 border border-forge-800 rounded-md text-xs text-white placeholder-forge-600 focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-forge-500">
            No matching tasks found.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isActive = task.id === activeTaskId;
            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`group relative p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  isActive
                    ? "bg-forge-800 border-cyan-500/50 shadow-sm"
                    : "bg-forge-900/60 border-forge-800/80 hover:bg-forge-850 hover:border-forge-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FolderGit2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-forge-500"}`} />
                    <span className="text-[11px] font-mono text-forge-400 truncate">{task.projectName}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this task?")) {
                        onDeleteTask(task.id);
                      }
                    }}
                    title="Delete task"
                    className="opacity-0 group-hover:opacity-100 p-1 text-forge-500 hover:text-rose-400 rounded transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs font-medium text-white line-clamp-2 mb-2">
                  {task.title}
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 border-t border-forge-800/60">
                  <StatusBadge status={task.status} size="sm" />
                  <span className="text-[10px] font-mono text-forge-500">
                    {new Date(task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
