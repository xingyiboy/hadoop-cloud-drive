import { create } from "zustand";
import { indexedDBService } from "@/services/indexedDB";

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "failed";
  catalogue: string;
  createTime: number;
  error?: string;
}

interface CreateTask {
  id: string;
  file: File;
  catalogue: string;
}

interface UploadStore {
  tasks: UploadTask[];
  initialized: boolean;
  initTasks: () => Promise<void>;
  addTasks: (newTasks: CreateTask[]) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  updateTaskStatus: (
    id: string,
    status: UploadTask["status"],
    error?: string
  ) => void;
  removeTask: (id: string) => void;
  clearTasksByStatus: (status?: UploadTask["status"]) => void;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  tasks: [],
  initialized: false,

  initTasks: async () => {
    if (get().initialized) return;
    try {
      const savedTasks = await indexedDBService.getTasks();
      set({ tasks: savedTasks, initialized: true });
    } catch (error) {
      console.error("Failed to load tasks from IndexedDB:", error);
      set({ initialized: true });
    }
  },

  addTasks: (newTasks) => {
    set((state) => {
      const updatedTasks = [
        ...state.tasks,
        ...newTasks.map((task) => ({
          id: task.id,
          file: task.file,
          progress: 0,
          status: "uploading" as const,
          catalogue: task.catalogue,
          createTime: Date.now(),
        })),
      ];
      // 保存到 IndexedDB
      indexedDBService.saveTasks(updatedTasks).catch((error) => {
        console.error("Failed to save tasks to IndexedDB:", error);
      });
      return { tasks: updatedTasks };
    });
  },

  updateTaskProgress: (id, progress) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === id ? { ...task, progress } : task
      );
      // 保存到 IndexedDB
      indexedDBService.saveTasks(updatedTasks).catch((error) => {
        console.error("Failed to save tasks to IndexedDB:", error);
      });
      return { tasks: updatedTasks };
    });
  },

  updateTaskStatus: (id, status, error) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === id ? { ...task, status, error } : task
      );
      // 保存到 IndexedDB
      indexedDBService.saveTasks(updatedTasks).catch((error) => {
        console.error("Failed to save tasks to IndexedDB:", error);
      });
      return { tasks: updatedTasks };
    });
  },

  removeTask: (id) => {
    set((state) => {
      const updatedTasks = state.tasks.filter((task) => task.id !== id);
      // 保存到 IndexedDB
      indexedDBService.saveTasks(updatedTasks).catch((error) => {
        console.error("Failed to save tasks to IndexedDB:", error);
      });
      return { tasks: updatedTasks };
    });
  },

  clearTasksByStatus: (status) => {
    set((state) => {
      const updatedTasks = status
        ? state.tasks.filter((task) => task.status !== status)
        : [];
      // 保存到 IndexedDB
      indexedDBService.saveTasks(updatedTasks).catch((error) => {
        console.error("Failed to save tasks to IndexedDB:", error);
      });
      return { tasks: updatedTasks };
    });
  },
}));
