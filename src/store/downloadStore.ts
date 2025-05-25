import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DownloadTask } from "@/types/download";

interface DownloadStore {
  tasks: DownloadTask[];
  addTasks: (tasks: DownloadTask[]) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  updateTaskStatus: (
    taskId: string,
    status: "downloading" | "downloaded" | "failed",
    error?: string
  ) => void;
  clearTasksByStatus: (
    status?: "downloading" | "downloaded" | "failed"
  ) => void;
  initTasks: () => void;
}

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set) => ({
      tasks: [],

      addTasks: (newTasks) =>
        set((state) => ({
          tasks: [...state.tasks, ...newTasks],
        })),

      updateTaskProgress: (taskId, progress) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, progress } : task
          ),
        })),

      updateTaskStatus: (taskId, status, error) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, status, error } : task
          ),
        })),

      clearTasksByStatus: (status) =>
        set((state) => ({
          tasks: status
            ? state.tasks.filter((task) => task.status !== status)
            : [],
        })),

      initTasks: () => {
        set({ tasks: [] });
      },
    }),
    {
      name: "download-store",
    }
  )
);
