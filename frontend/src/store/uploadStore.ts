import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexedDBService } from "@/services/indexedDB";
import { UPLOAD_SPEED, calculateProgress } from "@/utils/progress";
import { UploadStatus } from "../types/upload";

export interface UploadTask {
  id: string;
  file: File;
  fileName: string; // 添加文件名字段，用于持久化存储
  progress: number;
  status: UploadStatus;
  catalogue: string;
  createTime: number;
  error?: string;
  elapsedSeconds: number;
  sizeInBytes: number;
  deleteTask?: () => void;
}

interface CreateTask {
  id: string;
  file: File;
  catalogue: string;
}

interface UploadStore {
  tasks: UploadTask[];
  initialized: boolean;
  progressInterval: number | null;
  uploadingTaskId: string | null;
  initTasks: () => void;
  addTasks: (tasks: UploadTask[]) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  updateTaskStatus: (
    taskId: string,
    status: UploadStatus,
    error?: string
  ) => void;
  clearTasksByStatus: (status?: UploadStatus) => void;
  removeTask: (taskId: string) => void;
  startProgressUpdate: () => void;
  stopProgressUpdate: () => void;
  startNextUpload: () => void;
}

export const useUploadStore = create<UploadStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      initialized: false,
      progressInterval: null,
      uploadingTaskId: null,

      initTasks: () => {
        get().stopProgressUpdate();
        set({ tasks: [], uploadingTaskId: null });
        get().startProgressUpdate();
      },

      addTasks: (newTasks) =>
        set((state) => {
          const updatedTasks = [
            ...state.tasks,
            ...newTasks.map((task) => ({
              ...task,
              fileName: task.file.name, // 保存文件名用于持久化
              sizeInBytes: task.file.size, // 保存文件大小用于持久化
              status: "pending" as UploadStatus,
              elapsedSeconds: 0,
              progress: 0,
            })),
          ];

          if (!state.uploadingTaskId) {
            setTimeout(() => get().startNextUpload(), 0);
          }

          return { tasks: updatedTasks };
        }),

      updateTaskProgress: (taskId, progress) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, progress } : task
          ),
        })),

      updateTaskStatus: (taskId, status, error) =>
        set((state) => {
          const updatedTasks = state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status,
                  error,
                  progress: status === "success" ? 100 : task.progress,
                  elapsedSeconds:
                    status === "success" ? 0 : task.elapsedSeconds,
                }
              : task
          );

          if (
            (status === "success" || status === "failed") &&
            taskId === state.uploadingTaskId
          ) {
            setTimeout(() => {
              set({ uploadingTaskId: null });
              get().startNextUpload();
            }, 0);
          }

          return { tasks: updatedTasks };
        }),

      clearTasksByStatus: (status) =>
        set((state) => {
          // 如果正在上传的任务要被清除，先停止它
          if (state.uploadingTaskId) {
            const uploadingTask = state.tasks.find(
              (t) => t.id === state.uploadingTaskId
            );
            if (!status || uploadingTask?.status === status) {
              get().stopProgressUpdate();
            }
          }

          const updatedTasks = status
            ? state.tasks.filter((task) => task.status !== status)
            : [];

          // 重置上传状态
          if (
            !status ||
            state.tasks.find((t) => t.id === state.uploadingTaskId)?.status ===
              status
          ) {
            setTimeout(() => {
              set({ uploadingTaskId: null });
              if (updatedTasks.length > 0) {
                get().startProgressUpdate();
                get().startNextUpload();
              }
            }, 0);
          }

          return { tasks: updatedTasks };
        }),

      removeTask: (taskId) =>
        set((state) => {
          // 如果要删除的是正在上传的任务，先停止它
          if (taskId === state.uploadingTaskId) {
            get().stopProgressUpdate();
          }

          const updatedTasks = state.tasks.filter((task) => task.id !== taskId);

          // 如果删除的是当前上传任务，重置状态并开始下一个任务
          if (taskId === state.uploadingTaskId) {
            setTimeout(() => {
              set({ uploadingTaskId: null });
              if (updatedTasks.length > 0) {
                get().startProgressUpdate();
                get().startNextUpload();
              }
            }, 0);
          }

          return { tasks: updatedTasks };
        }),

      startProgressUpdate: () => {
        const store = get();
        if (store.progressInterval) {
          clearInterval(store.progressInterval);
        }

        const interval = setInterval(() => {
          set((state) => {
            const updatedTasks = state.tasks.map((task) => {
              if (
                task.status === "uploading" &&
                task.id === state.uploadingTaskId
              ) {
                const newElapsedSeconds = (task.elapsedSeconds || 0) + 1;
                const progress = calculateProgress(
                  task.sizeInBytes,
                  newElapsedSeconds,
                  UPLOAD_SPEED,
                  task.progress,
                  true
                );

                if (progress >= 100) {
                  setTimeout(() => {
                    get().updateTaskStatus(task.id, "success");
                  }, 0);
                }

                return {
                  ...task,
                  progress,
                  elapsedSeconds: newElapsedSeconds,
                };
              }
              return task;
            });
            return { tasks: updatedTasks };
          });
        }, 1000);

        set({ progressInterval: interval });
      },

      stopProgressUpdate: () => {
        const store = get();
        if (store.progressInterval) {
          clearInterval(store.progressInterval);
          set({ progressInterval: null });
        }
      },

      startNextUpload: () => {
        const store = get();
        if (store.uploadingTaskId) {
          return;
        }

        const nextTask = store.tasks.find((task) => task.status === "pending");
        if (nextTask) {
          set({ uploadingTaskId: nextTask.id });
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === nextTask.id
                ? {
                    ...task,
                    status: "uploading",
                    elapsedSeconds: 0,
                    progress: 0,
                  }
                : task
            ),
          }));
        }
      },
    }),
    {
      name: "upload-store",
    }
  )
);
