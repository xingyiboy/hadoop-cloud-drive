import { FileType } from "../enums/FileTypeEnum";

export interface DownloadFile {
  name: string;
  size: number;
  type: number;
}

export type DownloadStatus =
  | "pending"
  | "downloading"
  | "paused"
  | "downloaded"
  | "failed";

export interface DownloadTask {
  id: string;
  fileId: string; // 真实的文件ID，用于调用下载接口
  file: {
    name: string;
    size: number;
    type: any; // 这里使用实际的 FileType 类型
  };
  status: DownloadStatus;
  progress: number;
  error?: string;
  elapsedSeconds: number;
  sizeInBytes: number;
  createTime: number; // 添加创建时间字段
  originalSize: string; // 保存原始格式化的文件大小
  deleteTask: () => void;
}

export interface DownloadStore {
  tasks: DownloadTask[];
  downloadingTaskId: string | null;
  addTasks: (tasks: DownloadTask[]) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  updateTaskStatus: (
    taskId: string,
    status: DownloadStatus,
    error?: string
  ) => void;
  clearTasksByStatus: (status?: DownloadStatus) => void;
  removeTask: (taskId: string) => void;
  pauseActiveDownloads: () => void;
  pauseTask: (taskId: string) => void;
  resumeTask: (taskId: string) => void;
  resumeAllTasks: () => void;
  downloadSingleTask: (taskId: string) => void;
  pauseTasksByIds: (taskIds: string[]) => void;
  resumeTasksByIds: (taskIds: string[]) => void;
}
