import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DownloadTask, DownloadStatus } from "../types/download";
import { downloadFile } from "../api/file";

interface DownloadStore {
  tasks: DownloadTask[];
  progressInterval: ReturnType<typeof setInterval> | null;
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
  pauseActiveDownloads: () => void;
  pauseTask: (taskId: string) => void;
  resumeTask: (taskId: string) => void;
  resumeAllTasks: () => void;
  downloadSingleTask: (taskId: string) => void;
  pauseTasksByIds: (taskIds: string[]) => void;
  resumeTasksByIds: (taskIds: string[]) => void;
}

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      progressInterval: null,
      downloadingTaskId: null,

      addTasks: (newTasks) =>
        set((state) => {
          console.log(`📥 addTasks 被调用，添加 ${newTasks.length} 个新任务`);
          console.log(`🔍 当前downloadingTaskId: ${state.downloadingTaskId}`);
          console.log(`📊 当前任务数: ${state.tasks.length}`);
          
          const updatedTasks = [
            ...state.tasks,
            ...newTasks.map((task) => {
              const sizeInBytes =
                typeof task.file.size === "number"
                  ? task.file.size
                  : task.file.size;

              console.log(`➕ 添加任务: ${task.file.name}, ID: ${task.id}`);
              return {
                ...task,
                status: "pending" as DownloadStatus,
                elapsedSeconds: 0,
                sizeInBytes,
                progress: 0,
                originalSize: task.originalSize,
              };
            }),
          ];

          if (!state.downloadingTaskId) {
            console.log(`🚀 没有正在下载的任务，准备启动下载队列`);
            setTimeout(() => get().startNextDownload(), 0);
          } else {
            console.log(`⏸️ 已有正在下载的任务，等待当前任务完成: ${state.downloadingTaskId}`);
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
          console.log(`📝 updateTaskStatus 被调用: taskId=${taskId}, status=${status}, error=${error}`);
          console.log(`🔍 当前downloadingTaskId: ${state.downloadingTaskId}`);
          
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

          // 检查是否需要启动下一个任务
          let newDownloadingTaskId = state.downloadingTaskId;
          
          if (
            (status === "downloaded" || status === "failed") &&
            taskId === state.downloadingTaskId
          ) {
            console.log(`🔄 任务完成，准备启动下一个下载任务`);
            const pendingTasks = updatedTasks.filter(task => task.status === "pending");
            console.log(`📊 当前等待下载的任务数: ${pendingTasks.length}`);
            
            // 查找下一个待下载的任务
            const nextTask = updatedTasks.find((task) => task.status === "pending");
            if (nextTask) {
              console.log(`🚀 找到下一个任务，直接启动: ${nextTask.file.name}, ID: ${nextTask.id}`);
              newDownloadingTaskId = nextTask.id;
              
              // 同时更新下一个任务的状态
              const tasksWithNextDownloading = updatedTasks.map((task) =>
                task.id === nextTask.id
                  ? {
                      ...task,
                      status: "downloading" as DownloadStatus,
                      elapsedSeconds: 0,
                      progress: 0,
                    }
                  : task
              );
              
              return { 
                tasks: tasksWithNextDownloading,
                downloadingTaskId: newDownloadingTaskId
              };
            } else {
              console.log(`❌ 没有更多待下载的任务，清空downloadingTaskId`);
              newDownloadingTaskId = null;
            }
          }

          return { 
            tasks: updatedTasks,
            downloadingTaskId: newDownloadingTaskId
          };
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
        // 禁用模拟进度更新，使用真实下载进度
        console.log('使用真实下载，跳过模拟进度更新');
        const store = get();
        if (store.progressInterval) {
          clearInterval(store.progressInterval);
          set({ progressInterval: null });
        }
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
        console.log(`🔍 startNextDownload 被调用`);
        console.log(`📋 当前downloadingTaskId: ${store.downloadingTaskId}`);
        console.log(`📊 总任务数: ${store.tasks.length}`);
        
        if (store.downloadingTaskId) {
          console.log(`⏸️ 已有正在下载的任务，跳过: ${store.downloadingTaskId}`);
          return;
        }

        const pendingTasks = store.tasks.filter((task) => task.status === "pending");
        console.log(`⏳ 等待下载的任务数: ${pendingTasks.length}`);
        
        const nextTask = store.tasks.find((task) => task.status === "pending");
        if (nextTask) {
          console.log(`🚀 找到下一个任务: ${nextTask.file.name}, ID: ${nextTask.id}`);
          
          // 原子性更新：同时设置 downloadingTaskId 和任务状态
          set((state) => ({
            downloadingTaskId: nextTask.id,
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
          console.log(`✅ 任务状态已更新为downloading: ${nextTask.file.name}`);
        } else {
          console.log(`❌ 没有找到等待下载的任务`);
          // 打印所有任务的状态用于调试
          store.tasks.forEach((task, index) => {
            console.log(`任务${index + 1}: ${task.file.name}, 状态: ${task.status}, ID: ${task.id}`);
          });
        }
      },

      pauseActiveDownloads: () => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            // 如果是正在下载或待下载的任务，标记为暂停
            if (task.status === "downloading" || task.status === "pending") {
              return {
                ...task,
                status: "paused" as DownloadStatus,
                error: undefined,
              };
            }
            return task;
          }),
          downloadingTaskId: null, // 清除当前下载任务ID
        }));
        // 停止进度更新
        get().stopProgressUpdate();
      },

      pauseTask: (taskId) => {
        set((state) => {
          const updatedTasks = state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: "paused" as DownloadStatus,
                  error: undefined,
                }
              : task
          );

          // 如果暂停的是当前正在下载的任务，清除downloadingTaskId
          const newDownloadingTaskId = taskId === state.downloadingTaskId ? null : state.downloadingTaskId;

          return {
            tasks: updatedTasks,
            downloadingTaskId: newDownloadingTaskId,
          };
        });

        // 如果暂停的是当前正在下载的任务，启动下一个下载
        if (taskId === get().downloadingTaskId) {
          setTimeout(() => get().startNextDownload(), 0);
        }
      },

      resumeTask: (taskId) => {
        const store = get();
        const task = store.tasks.find(t => t.id === taskId);
        
        if (!task || task.status !== "paused") {
          return;
        }

        // 重置任务状态为pending
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "pending" as DownloadStatus,
                  progress: 0,
                  error: undefined,
                }
              : t
          ),
        }));

        // 直接开始下载这个任务
        setTimeout(() => get().downloadSingleTask(taskId), 0);
      },

      resumeAllTasks: () => {
        const store = get();
        const pausedTasks = store.tasks.filter(task => task.status === "paused");
        
        if (pausedTasks.length === 0) {
          return;
        }

        // 重置所有暂停任务的状态为pending
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.status === "paused"
              ? {
                  ...task,
                  status: "pending" as DownloadStatus,
                  progress: 0,
                  error: undefined,
                }
              : task
          ),
        }));

        // 逐个启动暂停的任务
        pausedTasks.forEach((task, index) => {
          setTimeout(() => get().downloadSingleTask(task.id), index * 100); // 间隔100ms启动
        });
      },

      downloadSingleTask: async (taskId) => {
        const store = get();
        const task = store.tasks.find(t => t.id === taskId);
        
        if (!task) {
          console.error(`找不到任务 ID: ${taskId}`);
          return;
        }

        // 更新任务状态为下载中
        store.updateTaskStatus(taskId, "downloading");
        
        try {
          console.log(`📥 开始下载: ${task.file.name}`);
          
          // 调用下载接口
          const response = await downloadFile({
            fileId: task.fileId, // 使用真实的文件ID
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded / progressEvent.total) * 100
                );
                store.updateTaskProgress(taskId, progress);
              }
            }
          });

          // 检查响应
          if (!response || !response.data) {
            throw new Error("下载失败：未收到文件数据");
          }

          // 获取文件名
          let filename = task.file.name;
          const contentDisposition = response.headers?.["content-disposition"];
          if (contentDisposition) {
            const matches = /filename\*=UTF-8''(.+)/.exec(contentDisposition);
            if (matches && matches[1]) {
              filename = decodeURIComponent(matches[1]);
            }
          }

          // 创建下载链接
          const blob = new Blob([response.data], {
            type: response.headers?.["content-type"] || "application/octet-stream",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();

          // 清理资源
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);

          // 下载成功
          store.updateTaskStatus(taskId, "downloaded");
          console.log(`✅ 下载完成: ${filename}`);
          
        } catch (error) {
          console.error(`❌ 下载失败: ${task.file.name}`, error);
          store.updateTaskStatus(
            taskId, 
            "failed", 
            error instanceof Error ? error.message : "下载失败"
          );
        }
      },

      pauseTasksByIds: (taskIds) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            taskIds.includes(task.id)
              ? {
                  ...task,
                  status: "paused" as DownloadStatus,
                  error: undefined,
                }
              : task
          ),
        }));
      },

      resumeTasksByIds: (taskIds) => {
        const store = get();
        const tasksToResume = store.tasks.filter(
          task => taskIds.includes(task.id) && task.status === "paused"
        );
        
        if (tasksToResume.length === 0) {
          return;
        }

        // 重置指定任务的状态为pending
        set((state) => ({
          tasks: state.tasks.map((task) =>
            taskIds.includes(task.id) && task.status === "paused"
              ? {
                  ...task,
                  status: "pending" as DownloadStatus,
                  progress: 0,
                  error: undefined,
                }
              : task
          ),
        }));

        // 逐个启动这些任务
        tasksToResume.forEach((task, index) => {
          setTimeout(() => get().downloadSingleTask(task.id), index * 100); // 间隔100ms启动
        });
      },
    }),
    {
      name: "download-store",
    }
  )
);