import { create } from "zustand";

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
  addTask: (task: DownloadTask) => void;
  updateTask: (id: string, updates: Partial<DownloadTask>) => void;
  removeTask: (id: string) => void;
  clearTasksByStatus: (
    status?: "downloading" | "downloaded" | "failed"
  ) => void;
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  tasks: [],
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  clearTasksByStatus: (status) =>
    set((state) => ({
      tasks: status ? state.tasks.filter((task) => task.status !== status) : [],
    })),
}));
