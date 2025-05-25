import { FileType } from "../enums/FileTypeEnum";

export interface DownloadFile {
  name: string;
  size: number;
  type: number;
}

export interface DownloadTask {
  id: string;
  file: DownloadFile;
  status: "downloading" | "downloaded" | "failed";
  progress: number;
  error?: string;
}

export interface DownloadStore {
  tasks: DownloadTask[];
  addTasks: (tasks: DownloadTask[]) => void;
  updateTaskStatus: (
    taskId: string,
    status: DownloadTask["status"],
    error?: string
  ) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  clearTasksByStatus: (status?: DownloadTask["status"]) => void;
}
