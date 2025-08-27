/**
 * 文件操作管理hook
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import {
  deleteFile,
  shareFile,
  cancelShare,
  batchShareFiles,
  renameFile,
  moveFile,
  createFile,
  getFileList,
  restoreFile,
  permanentDeleteFile,
} from "@/api/file";
import request from "@/utils/request";
import { useUploadStore } from "@/store/uploadStore";
import { useDownloadStore } from "@/store/downloadStore";
import { getFileTypeByExt, FileType } from "@/enums/FileTypeEnum";
import { generateStatsMessage, calculateTaskStats } from "@/utils/fileUtils";
import { FileInfo } from "@/types/file";
import type { RcFile } from "antd/lib/upload";

interface UseFileOperationsProps {
  currentPath: string;
  fileType?: number;
  onRefresh: () => void;
  onTabChange?: (tab: number) => void;
  fileList?: FileInfo[];
}

interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
}

export const useFileOperations = ({
  currentPath,
  fileType,
  onRefresh,
  onTabChange,
  fileList,
}: UseFileOperationsProps) => {
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const uploadStore = useUploadStore.getState();
  const downloadStore = useDownloadStore();

  // 下载文件API调用
  const downloadFile = (
    fileId: string,
    onDownloadProgress?: (progressEvent: any) => void
  ): Promise<any> => {
    return request.get(`/admin-api/system/hadoop-file/download/${fileId}`, {
      responseType: "blob",
      onDownloadProgress,
      headers: {
        // 如果支持断点续传，可以添加 Range 头
        // Range: `bytes=${startByte}-${endByte}`
      },
    });
  };

  // 文件上传
  const handleFileUpload = useCallback(async (fileList: File[] | RcFile[]) => {
    const fileArray = Array.from(fileList);
    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;

    // 生成任务并添加到上传队列
    const tasks = fileArray.map((file) => {
      const taskId = `${file.name}-${Date.now()}-${Math.random()}`;
      return {
        id: taskId,
        file,
        fileName: file.name,
        catalogue: currentPath,
        status: "pending" as const,
        progress: 0,
        createTime: Date.now(),
        elapsedSeconds: 0,
        sizeInBytes: file.size,
        deleteTask: () => uploadStore.removeTask(taskId),
      };
    });

    // 添加任务到上传队列
    uploadStore.addTasks(tasks);
    message.success(`已添加 ${fileArray.length} 个文件到上传队列`);

    // 自动跳转到正在上传页面
    if (onTabChange) {
      onTabChange(3);
    }
    navigate("/upload/uploading");

    // 开始逐个上传文件
    for (const [index, file] of fileArray.entries()) {
      const task = tasks[index];
      try {
        const fileTypeEnum = getFileTypeByExt(file.name);

        // 创建 FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);
        formData.append("type", fileTypeEnum.toString());
        formData.append("catalogue", currentPath);
        formData.append("size", (file.size / (1024 * 1024)).toFixed(2));

        // 上传文件
        const res = await createFile(formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              uploadStore.updateTaskProgress(task.id, progress);
            }
          },
        });

        if (res.code === 0) {
          uploadStore.updateTaskStatus(task.id, "success");
          successCount++;
          onRefresh();
        } else {
          uploadStore.updateTaskStatus(
            task.id,
            "failed",
            res.msg || "上传失败"
          );
          failedCount++;
        }
      } catch (error) {
        uploadStore.updateTaskStatus(task.id, "failed", "上传失败");
        failedCount++;
        console.error("Upload error:", error);
      }
    }

    // 计算统计信息
    const endTime = Date.now();
    const duration = endTime - startTime;
    const stats = { successCount, failedCount };
    message.success(generateStatsMessage(stats, duration, "upload"));

    // 如果所有文件上传成功，自动跳转到已上传页面
    if (successCount > 0 && failedCount === 0) {
      setTimeout(() => {
        if (onTabChange) {
          onTabChange(3); // 保持在上传tab
        }
        navigate("/upload/success");
        message.info("所有文件上传完成，已自动跳转到已上传页面");
      }, 2000); // 延迟2秒让用户看到完成信息
    }
  }, [currentPath, uploadStore, onRefresh, onTabChange, navigate]);

  // 单个文件/文件夹下载 - 支持文件夹递归下载
  const handleSingleDownload = useCallback(async (record: FileInfo) => {
    try {
      setActionLoading(true);
      let newTaskIds: string[] = [];

      // 检查是否为文件夹
      if (Number(record.type) === FileType.DIRECTORY) {
        console.log(`📁 开始下载文件夹: ${record.name}`);
        
        // 获取文件夹路径
        const directoryPath = currentPath === "/" 
          ? `/${record.name}` 
          : `${currentPath}/${record.name}`;
        
        // 递归获取文件夹中的所有文件
        const allFiles = await getAllFilesInDirectory(directoryPath, record.name);
        
        if (allFiles.length === 0) {
          message.warning(`文件夹 ${record.name} 中没有可下载的文件`);
          setActionLoading(false);
          return;
        }

        console.log(`📊 文件夹 ${record.name} 包含 ${allFiles.length} 个文件`);
        message.info(`开始下载文件夹 ${record.name}，共 ${allFiles.length} 个文件...`);

        // 为所有文件创建下载任务
        const tasks = allFiles.map((file) => {
          const taskId = `${file.name}-${Date.now()}-${Math.random()}`;
          return {
            id: taskId,
            fileId: file.id.toString(),
            file: {
              name: file.name,
              size: parseFloat(file.size || "0"),
              type: file.type,
            },
            status: "pending" as const,
            progress: 0,
            error: undefined,
            elapsedSeconds: 0,
            sizeInBytes: parseFloat(file.size || "0"),
            createTime: Date.now(),
            originalSize: (file.size && file.size.trim() !== "" && file.size !== "0") 
              ? file.size 
              : `${(parseFloat(file.size || "0") / (1024 * 1024)).toFixed(2)} MB`,
            deleteTask: () => downloadStore.removeTask(taskId),
          };
        });

        // 添加任务到下载队列
        downloadStore.addTasks(tasks);
        newTaskIds = tasks.map(task => task.id);

      } else {
        console.log(`📄 开始下载单个文件: ${record.name}`);
        
        // 普通文件，创建单个下载任务
        const taskId = `${record.name}-${Date.now()}-${Math.random()}`;
        const task = {
          id: taskId,
          fileId: record.id.toString(),
          file: {
            name: record.name,
            size: parseFloat(record.size || "0"),
            type: record.type,
          },
          status: "pending" as const,
          progress: 0,
          error: undefined,
          elapsedSeconds: 0,
          sizeInBytes: parseFloat(record.size || "0"),
          createTime: Date.now(),
          originalSize: (record.size && record.size.trim() !== "" && record.size !== "0") 
            ? record.size 
            : `${(parseFloat(record.size || "0") / (1024 * 1024)).toFixed(2)} MB`,
          deleteTask: () => downloadStore.removeTask(taskId),
        };

        // 添加任务到下载队列
        downloadStore.addTasks([task]);
        newTaskIds = [taskId];
      }

      // 自动跳转到正在下载页面
      if (onTabChange) {
        onTabChange(4);
      }
      navigate("/download/downloading");
      setActionLoading(false);

      // 立即将新任务设为暂停状态
      downloadStore.pauseTasksByIds(newTaskIds);

      // 1秒后开始下载这些新任务
      setTimeout(() => {
        downloadStore.resumeTasksByIds(newTaskIds);
      }, 1000);

    } catch (error) {
      console.error("Download error:", error);
      message.error(`下载失败: ${error instanceof Error ? error.message : "未知错误"}`);
      setActionLoading(false);
    }
  }, [downloadStore, currentPath, onTabChange, navigate]);

  // 递归获取文件夹中的所有文件
  const getAllFilesInDirectory = async (
    directoryPath: string,
    directoryName: string = ""
  ): Promise<FileInfo[]> => {
    const allFiles: FileInfo[] = [];
    
    try {
      console.log(`🔍 正在获取文件夹内容: ${directoryPath}`);
      
      let currentPage = 1;
      let hasMoreData = true;
      const pageSize = 100; // 服务器限制最大值为100
      
      // 分页获取所有文件
      while (hasMoreData) {
        console.log(`📄 获取第 ${currentPage} 页，每页 ${pageSize} 条`);
        
        const res = await getFileList({
          catalogue: directoryPath,
          pageSize: pageSize,
          pageNo: currentPage,
        });

        console.log(`📡 第${currentPage}页 API响应:`, {
          code: res.code,
          hasData: !!res.data,
          total: res.data ? (res.data as any).total : 0,
          listLength: res.data ? ((res.data as any).list || []).length : 0
        });

        if (res.code === 0 && res.data) {
          const files = (res.data as any).list || [];
          const total = (res.data as any).total || 0;
          
          console.log(`📁 文件夹 ${directoryPath} 第${currentPage}页包含 ${files.length} 个项目，总计 ${total} 个`);
          
          for (const file of files) {
            console.log(`🔍 处理项目: ${file.name}, 类型: ${file.type}`);
            
            if (Number(file.type) === FileType.DIRECTORY) {
              // 如果是文件夹，递归获取子文件
              const subPath = directoryPath === "/" 
                ? `/${file.name}` 
                : `${directoryPath}/${file.name}`;
              console.log(`🔄 递归处理子文件夹: ${subPath}`);
              const subFiles = await getAllFilesInDirectory(subPath, file.name);
              allFiles.push(...subFiles);
            } else {
              // 如果是文件，直接添加到列表
              const fileToAdd = {
                ...file,
                // 为子文件夹中的文件添加路径前缀，便于识别
                name: directoryName ? `${directoryName}/${file.name}` : file.name,
              };
              console.log(`✅ 添加文件到下载列表:`, fileToAdd);
              allFiles.push(fileToAdd);
            }
          }
          
          // 检查是否还有更多数据
          const currentTotal = currentPage * pageSize;
          hasMoreData = files.length === pageSize && currentTotal < total;
          currentPage++;
          
          console.log(`📊 当前已处理 ${currentTotal} 个，总计 ${total} 个，还有更多数据: ${hasMoreData}`);
        } else {
          console.log(`❌ API调用失败或无数据: code=${res.code}, msg=${res.msg}`);
          hasMoreData = false;
        }
      }
    } catch (error) {
      console.error(`❌ 获取文件夹 ${directoryPath} 内容失败:`, error);
      throw error;
    }

    console.log(`📊 文件夹 ${directoryPath} 最终返回 ${allFiles.length} 个文件`);
    return allFiles;
  };



  // 批量下载 - 重写为简单直接的逻辑
  const handleBatchDownload = useCallback(async (selectedRowKeys: string[], onComplete?: () => void) => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要下载的文件");
      return;
    }

    try {
      setActionLoading(true);
      
      // 获取所有选中文件的信息
      const allSelectedFiles: FileInfo[] = [];
      const pageSize = 100;
      const totalPages = Math.ceil(selectedRowKeys.length / pageSize);

      console.log('🔍 批量下载调试信息:');
      console.log('选中的文件ID:', selectedRowKeys);

      // 分页获取所有选中的文件详情
      for (let page = 1; page <= totalPages; page++) {
        try {
          const response = await getFileList({
            catalogue: fileType === undefined ? currentPath : undefined,
            type: fileType,
            pageNo: page,
            pageSize: pageSize,
            excludeShared: fileType !== 8,
          });

          if (response.code === 0 && response.data) {
            const pageFiles = (response.data as any).list?.filter((file: FileInfo) =>
              selectedRowKeys.includes(file.id.toString())
            ) || [];
            allSelectedFiles.push(...pageFiles);
          }
        } catch (error) {
          console.error(`获取第${page}页文件失败:`, error);
        }
      }

      if (allSelectedFiles.length === 0) {
        message.error("未找到要下载的文件，请重新选择");
        return;
      }

      // 分离文件和文件夹
      const regularFiles: FileInfo[] = [];
      const directories: FileInfo[] = [];
      
      allSelectedFiles.forEach(item => {
        if (Number(item.type) === FileType.DIRECTORY) {
          directories.push(item);
        } else {
          regularFiles.push(item);
        }
      });

      console.log('📄 普通文件数量:', regularFiles.length);
      console.log('📂 文件夹数量:', directories.length);
      
      // 获取文件夹中的所有文件
      const allFiles: FileInfo[] = [...regularFiles];
      
      for (const directory of directories) {
        try {
          const directoryPath = currentPath === "/" 
            ? `/${directory.name}` 
            : `${currentPath}/${directory.name}`;
          
          const filesInDirectory = await getAllFilesInDirectory(directoryPath, directory.name);
          console.log(`📄 文件夹 ${directory.name} 中找到 ${filesInDirectory.length} 个文件`);
          allFiles.push(...filesInDirectory);
        } catch (error) {
          console.error(`❌ 获取文件夹 ${directory.name} 内容失败:`, error);
          message.error(`获取文件夹 ${directory.name} 内容失败`);
        }
      }

      if (allFiles.length === 0) {
        message.error("选中的文件夹中没有可下载的文件");
        return;
      }

      console.log(`📊 开始下载 ${allFiles.length} 个文件`);
      message.info(`开始下载 ${allFiles.length} 个文件...`);

      // 创建下载任务（仅用于UI显示）
      const tasks = allFiles.map((file) => {
        const taskId = `${file.name}-${Date.now()}-${Math.random()}`;
        return {
          id: taskId,
          fileId: file.id.toString(), // 添加真实的文件ID
          file: {
            name: file.name,
            size: parseFloat(file.size || "0"),
            type: file.type,
          },
          status: "pending" as const,
          progress: 0,
          error: undefined,
          elapsedSeconds: 0,
          sizeInBytes: parseFloat(file.size || "0"),
          createTime: Date.now(),
          originalSize: (file.size && file.size.trim() !== "" && file.size !== "0") 
            ? file.size 
            : `${(parseFloat(file.size || "0") / (1024 * 1024)).toFixed(2)} MB`,
          deleteTask: () => downloadStore.removeTask(taskId),
        };
      });

      // 添加任务到下载队列（用于UI显示）
      downloadStore.addTasks(tasks);

      // 自动跳转到正在下载页面
      if (onTabChange) {
        onTabChange(4);
      }
      navigate("/download/downloading");
      setActionLoading(false);

      // 立即将新任务设为暂停状态
      const newTaskIds = tasks.map(task => task.id);
      downloadStore.pauseTasksByIds(newTaskIds);

      // 1秒后开始下载这些新任务
      setTimeout(() => {
        downloadStore.resumeTasksByIds(newTaskIds);
      }, 1000);
      
      // 下载完成后清除选择状态
      onComplete?.();

    } catch (error) {
      console.error("Batch download error:", error);
      message.error("批量下载失败");
      setActionLoading(false);
    }
  }, [downloadStore, currentPath, fileType, onTabChange, navigate]);

  // 单个文件分享
  const handleSingleShare = useCallback(async (record: FileInfo) => {
    try {
      setActionLoading(true);
      const res = await shareFile(record.id.toString());
      if (res.code === 0) {
        message.success("分享成功");
        onRefresh();
      } else {
        message.error(res.msg || "分享失败");
      }
    } catch (error) {
      message.error("分享失败");
      console.error("Share error:", error);
    } finally {
      setActionLoading(false);
    }
  }, [onRefresh]);

  // 单个文件删除
  const handleSingleDelete = useCallback(async (record: FileInfo) => {
    try {
      setActionLoading(true);
      const res = await deleteFile(record.id.toString());
      if (res.code === 0) {
        message.success("已移动到回收站");
        onRefresh();
      } else {
        message.error(res.msg || "移动到回收站失败");
      }
    } catch (error) {
      message.error("移动到回收站失败");
      console.error("Delete error:", error);
    } finally {
      setActionLoading(false);
    }
  }, [onRefresh]);

  // 批量分享
  const handleBatchShare = useCallback(async (selectedRowKeys: string[], onComplete?: () => void) => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要分享的文件");
      return;
    }

    try {
      setActionLoading(true);
      const res = await batchShareFiles(selectedRowKeys);
      if (res.code === 0) {
        message.success(`成功分享 ${selectedRowKeys.length} 个文件`);
        onRefresh();
        onComplete?.(); // 清除选择状态
      } else {
        message.error(res.msg || "批量分享失败");
      }
    } catch (error) {
      message.error("批量分享失败");
      console.error("Batch share error:", error);
    } finally {
      setActionLoading(false);
    }
  }, [onRefresh]);

  // 批量取消分享
  const handleBatchCancelShare = useCallback(async (selectedRowKeys: string[], onComplete?: () => void) => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要取消分享的文件");
      return;
    }

    try {
      setActionLoading(true);
      for (const id of selectedRowKeys) {
        const res = await cancelShare(id);
        if (res.code !== 0) {
          message.error(`取消分享(ID: ${id})失败: ${res.msg || ''}`);
        }
      }
      if (selectedRowKeys.length === 1) {
        message.success("取消分享完成");
      } else {
        message.success("批量取消分享完成");
      }
      onRefresh();
      onComplete?.(); // 清除选择状态
    } catch (error) {
      message.error("批量取消分享失败");
      console.error("Batch cancel share error:", error);
    } finally {
      setActionLoading(false);
    }
  }, [onRefresh]);

  // 批量删除
  const handleBatchDelete = useCallback(async (selectedRowKeys: string[], onComplete?: () => void) => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要删除的文件");
      return;
    }

    try {
      setActionLoading(true);
      for (const id of selectedRowKeys) {
        const res = await deleteFile(id);
        if (res.code !== 0) {
          message.error(`移动文件(ID: ${id})到回收站失败: ${res.msg}`);
        }
      }

      message.success("已批量移动到回收站");
      onRefresh();
      onComplete?.(); // 清除选择状态
    } catch (error) {
      message.error("批量移动到回收站失败");
      console.error("Batch delete error:", error);
    } finally {
      setActionLoading(false);
    }
  }, [onRefresh]);

  // 批量恢复（回收站）
  const handleBatchRestore = useCallback(async (selectedRowKeys: string[], onComplete?: () => void) => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要恢复的文件");
      return;
    }

    try {
      setActionLoading(true);
      for (const id of selectedRowKeys) {
        const res = await restoreFile(id);
        if (res.code !== 0) {
          message.error(`恢复文件(ID: ${id})失败: ${res.msg || ''}`);
        }
      }
      message.success("恢复完成");
      onRefresh();
      onComplete?.(); // 清除选择状态
    } catch (error) {
      message.error("批量恢复失败");
      console.error("Batch restore error:", error);
    } finally {
      setActionLoading(false);
    }
  }, [onRefresh]);

  // 批量永久删除（回收站）
  const handleBatchPermanentDelete = useCallback((selectedRowKeys: string[], onComplete?: () => void) => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要永久删除的文件");
      return;
    }

    Modal.confirm({
      title: "确认永久删除",
      content: "该操作不可恢复，确定要永久删除选中的文件吗？",
      okText: "永久删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          setActionLoading(true);
          for (const id of selectedRowKeys) {
            const res = await permanentDeleteFile(id);
            if (res.code !== 0) {
              message.error(`永久删除文件(ID: ${id})失败: ${res.msg || ''}`);
            }
          }
          message.success("永久删除完成");
          onRefresh();
          onComplete?.(); // 清除选择状态
        } catch (error) {
          message.error("批量永久删除失败");
          console.error("Batch permanent delete error:", error);
        } finally {
          setActionLoading(false);
        }
      },
    });
  }, [onRefresh]);

  // 文件重命名
  const handleRename = useCallback(async (fileId: string, newName: string) => {
    try {
      setActionLoading(true);
      const res = await renameFile(fileId, newName);
      if (res.code === 0) {
        message.success("重命名成功");
        onRefresh();
        return true;
      } else {
        message.error(res.msg || "重命名失败");
        return false;
      }
    } catch (error) {
      message.error("重命名失败");
      console.error("Rename error:", error);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [onRefresh]);

  // 文件移动
  const handleMove = useCallback(async (fileId: number, targetPath: string) => {
    try {
      setActionLoading(true);
      const res = await moveFile(fileId, targetPath);
      if (res.code === 0) {
        message.success("移动成功");
        onRefresh();
        return true;
      } else {
        message.error(res.msg || "移动失败");
        return false;
      }
    } catch (error) {
      message.error("移动失败");
      console.error("Move error:", error);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [onRefresh]);

  // 创建文件夹
  const handleCreateFolder = useCallback(async (name: string) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", "6"); // DIRECTORY type
      formData.append("catalogue", currentPath);

      const res = await createFile(formData);

      if (res.code === 0) {
        message.success("文件夹创建成功");
        onRefresh();
        return true;
      } else {
        message.error(res.msg || "文件夹创建失败");
        return false;
      }
    } catch (error) {
      message.error("文件夹创建失败");
      console.error("Create folder error:", error);
      return false;
    }
  }, [currentPath, onRefresh]);

  return {
    actionLoading,
    handleFileUpload,
    handleSingleDownload,
    handleSingleShare,
    handleSingleDelete,
    handleBatchDownload,
    handleBatchShare,
    handleBatchCancelShare,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchPermanentDelete,
    handleRename,
    handleMove,
    handleCreateFolder,
  };
};
