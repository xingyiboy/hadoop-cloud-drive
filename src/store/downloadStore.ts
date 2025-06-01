import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DownloadTask, DownloadStatus } from "../types/download";
import {
  DOWNLOAD_SPEED,
  calculateProgress,
  convertToBytes,
} from "@/utils/progress";

interface DownloadStore {
  tasks: DownloadTask[];
  progressInterval: NodeJS.Timeout | null;
  downloadingTaskId: string | null;
  addTasks: (tasks: DownloadTask[]) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  updateTaskStatus: (
    taskId: string,
    status: DownloadStatus,
    error?: string
  ) => void;
  clearTasksByStatus: (status?: DownloadStatus) => void;
  initTasks: () => void;
  removeTask: (taskId: string) => void;
  startProgressUpdate: () => void;
  stopProgressUpdate: () => void;
  startNextDownload: () => void;
}

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      progressInterval: null,
      downloadingTaskId: null,

      addTasks: (newTasks) =>
        set((state) => {
          const updatedTasks = [
            ...state.tasks,
            ...newTasks.map((task) => {
              const sizeInBytes =
                typeof task.file.size === "number"
                  ? task.file.size
                  : task.file.size;

              return {
                ...task,
                status: "pending" as DownloadStatus,
                elapsedSeconds: 0,
                sizeInBytes,
                progress: 0,
              };
            }),
          ];

          if (!state.downloadingTaskId) {
            setTimeout(() => get().startNextDownload(), 0);
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
                  progress: status === "downloaded" ? 100 : task.progress,
                  elapsedSeconds:
                    status === "downloaded" ? 0 : task.elapsedSeconds,
                }
              : task
          );

          if (
            (status === "downloaded" || status === "failed") &&
            taskId === state.downloadingTaskId
          ) {
            setTimeout(() => {
              set({ downloadingTaskId: null });
              get().startNextDownload();
            }, 0);
          }

          return { tasks: updatedTasks };
        }),

      clearTasksByStatus: (status) =>
        set((state) => {
          if (state.downloadingTaskId) {
            const downloadingTask = state.tasks.find(
              (t) => t.id === state.downloadingTaskId
            );
            if (!status || downloadingTask?.status === status) {
              get().stopProgressUpdate();
            }
          }

          const updatedTasks = status
            ? state.tasks.filter((task) => task.status !== status)
            : [];

          if (
            !status ||
            state.tasks.find((t) => t.id === state.downloadingTaskId)
              ?.status === status
          ) {
            setTimeout(() => {
              set({ downloadingTaskId: null });
              if (updatedTasks.length > 0) {
                get().startProgressUpdate();
                get().startNextDownload();
              }
            }, 0);
          }

          return { tasks: updatedTasks };
        }),

      removeTask: (taskId) =>
        set((state) => {
          if (taskId === state.downloadingTaskId) {
            get().stopProgressUpdate();
          }

          const updatedTasks = state.tasks.filter((task) => task.id !== taskId);

          if (taskId === state.downloadingTaskId) {
            setTimeout(() => {
              set({ downloadingTaskId: null });
              if (updatedTasks.length > 0) {
                get().startProgressUpdate();
                get().startNextDownload();
              }
            }, 0);
          }

          return { tasks: updatedTasks };
        }),

      initTasks: () => {
        get().stopProgressUpdate();
        set({ tasks: [], downloadingTaskId: null });
        get().startProgressUpdate();
      },

      startProgressUpdate: () => {
        const store = get();
        if (store.progressInterval) {
          clearInterval(store.progressInterval);
        }

        const interval = setInterval(() => {
          set((state) => {
            const updatedTasks = state.tasks.map((task) => {
              if (
                task.status === "downloading" &&
                task.id === state.downloadingTaskId
              ) {
                const newElapsedSeconds = (task.elapsedSeconds || 0) + 1;
                const sizeInBytes =
                  typeof task.sizeInBytes === "number" ? task.sizeInBytes : 0;
                const progress = calculateProgress(
                  sizeInBytes,
                  newElapsedSeconds,
                  DOWNLOAD_SPEED,
                  task.progress,
                  false
                );

                if (progress >= 100) {
                  setTimeout(() => {
                    get().updateTaskStatus(task.id, "downloaded");
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

      startNextDownload: () => {
        const store = get();
        if (store.downloadingTaskId) {
          return;
        }

        const nextTask = store.tasks.find((task) => task.status === "pending");
        if (nextTask) {
          set({ downloadingTaskId: nextTask.id });
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === nextTask.id
                ? {
                    ...task,
                    status: "downloading",
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
      name: "download-store",
    }
  )
);
