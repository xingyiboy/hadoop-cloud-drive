import { create } from "zustand";
import { DownloadStore, DownloadTask } from "@/types/download";

interface DownloadFile {
  name: string;
  size: number;
}

interface DownloadTask {
  id: string;
  file: DownloadFile;
  status: "pending" | "downloading" | "downloaded" | "failed";
  progress: number;
  error?: string;
}

interface DownloadStore {
  tasks: DownloadTask[];
  addTasks: (newTasks: DownloadTask[]) => void;
  updateTaskStatus: (
    taskId: string,
    status: "pending" | "downloading" | "downloaded" | "failed",
    error?: string
  ) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  clearTasksByStatus: (
    status?: "downloading" | "downloaded" | "failed"
  ) => void;
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  tasks: [],
  addTasks: (newTasks) =>
    set((state) => ({
      tasks: [...state.tasks, ...newTasks],
    })),
  updateTaskStatus: (taskId, status, error) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status, error: error || null } : task
      ),
    })),
  updateTaskProgress: (taskId, progress) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, progress } : task
      ),
    })),
  clearTasksByStatus: (status) =>
    set((state) => ({
      tasks: status ? state.tasks.filter((task) => task.status !== status) : [],
    })),
}));
