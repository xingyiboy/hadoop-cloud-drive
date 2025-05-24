import { create } from "zustand";

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
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
  addTasks: (newTasks: CreateTask[]) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  updateTaskStatus: (
    id: string,
    status: UploadTask["status"],
    error?: string
  ) => void;
  removeTask: (id: string) => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  tasks: [],
  addTasks: (newTasks) => {
    set((state) => ({
      tasks: [
        ...state.tasks,
        ...newTasks.map((task) => ({
          id: task.id,
          file: task.file,
          progress: 0,
          status: "pending" as const,
          catalogue: task.catalogue,
          createTime: Date.now(),
        })),
      ],
    }));
  },
  updateTaskProgress: (id, progress) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, progress } : task
      ),
    }));
  },
  updateTaskStatus: (id, status, error) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status, error } : task
      ),
    }));
  },
  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },
}));
