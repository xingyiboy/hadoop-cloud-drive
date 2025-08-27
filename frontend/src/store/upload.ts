import { create } from "zustand";

export interface UploadFile {
  name: string;
  size: number;
  type: string;
}

export interface UploadTask {
  id: string;
  file: UploadFile;
  status: "uploading" | "success" | "failed";
  progress: number;
  error?: string;
}

interface UploadStore {
  uploadTasks: UploadTask[];
  addTask: (task: UploadTask) => void;
  updateTask: (id: string, updates: Partial<UploadTask>) => void;
  removeTask: (id: string) => void;
  clearTasks: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploadTasks: [],
  addTask: (task) =>
    set((state) => ({
      uploadTasks: [...state.uploadTasks, task],
    })),
  updateTask: (id, updates) =>
    set((state) => ({
      uploadTasks: state.uploadTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  removeTask: (id) =>
    set((state) => ({
      uploadTasks: state.uploadTasks.filter((task) => task.id !== id),
    })),
  clearTasks: () =>
    set(() => ({
      uploadTasks: [],
    })),
}));
