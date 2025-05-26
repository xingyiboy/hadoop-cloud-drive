import {
  Layout,
  Button,
  Input,
  Table,
  Checkbox,
  Upload,
  message,
  Pagination,
  Spin,
} from "antd";
import type { RcFile } from "antd/lib/upload";
import type { SorterResult } from "antd/lib/table/interface";
import {
  UploadOutlined,
  FolderAddOutlined,
  CloudDownloadOutlined,
  ShareAltOutlined,
  SettingOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  DeleteOutlined,
  UndoOutlined,
  CopyOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import "../layout/style/content-main.scss";
import BreadcrumbNav from "./BreadcrumbNav";
import CreateFolderModal from "./CreateFolderModal";
import { FileType, FileTypeMap, getFileTypeByExt } from "../enums/FileTypeEnum";
import { createFile, getFileList, downloadFile, deleteFile } from "@/api/file";
import { FileInfo } from "@/types/file";
import { useUploadStore } from "@/store/uploadStore";
import { useDownloadStore } from "@/store/downloadStore";
import dayjs from "dayjs";
import request from "@/utils/request";
import { shareFile, cancelShare, batchShareFiles } from "@/api/file";
import { useLocation } from "react-router-dom";

const { Content } = Layout;

interface DiskContentProps {
  fileType: FileType | undefined;
}

interface FileListResponse {
  list: FileInfo[];
  total: number;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
  headers?: {
    [key: string]: string;
  };
}

interface DownloadResponse {
  code: number;
  data: Blob;
  msg?: string;
  headers: {
    [key: string]: string;
  };
}

// 在组件外部定义格式化函数
const formatDateTime = (timestamp: number): string => {
  if (!timestamp) return "-";
  // 如果是13位时间戳，需要除以1000转换为正确的时间
  const normalizedTimestamp =
    String(timestamp).length === 13 ? timestamp / 1000 : timestamp;
  return dayjs(normalizedTimestamp * 1000).format("YYYY-MM-DD HH:mm:ss");
};

// 在 DiskContent 组件的开头添加新的接口和状态
interface GroupedSharedFile {
  shareKey: string;
  files: FileInfo[];
}

const DiskContent: React.FC<DiskContentProps> = ({ fileType }) => {
  // 选中的文件keys
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 所有已加载文件的ID缓存，用于跨页全选
  const [loadedFileIds, setLoadedFileIds] = useState<Set<string>>(new Set());
  // 当前路径
  const [currentPath, setCurrentPath] = useState<string>(
    localStorage.getItem("currentPath") || "/"
  );
  // 新建文件夹弹窗
  const [createFolderVisible, setCreateFolderVisible] = useState(false);
  // 文件列表
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState("");
  // 分页参数
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  // 排序状态
  const [sortState, setSortState] = useState<{
    field: string | null;
    order: "ascend" | "descend" | null;
  }>({
    field: null,
    order: null,
  });
  // 在 DiskContent 组件的开头添加新的接口和状态
  const [groupedSharedFiles, setGroupedSharedFiles] = useState<
    GroupedSharedFile[]
  >([]);
  const [actionLoading, setActionLoading] = useState(false);
  // 添加视图类型状态
  const [viewType, setViewType] = useState<"list" | "grid">("list");

  const location = useLocation();
  const baseUrl = window.location.origin;

  // 自定义加载图标
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  // 加载文件列表
  const loadFileList = async (
    page = 1,
    type: FileType | undefined = undefined,
    size: number = pagination.pageSize
  ) => {
    try {
      setLoading(true);
      const res = await getFileList({
        catalogue: type === undefined ? currentPath : undefined,
        type,
        name: searchKeyword,
        pageNo: page,
        pageSize: size,
        sortField: sortState.field || undefined,
        sortOrder: sortState.order || undefined,
        excludeShared: type !== 8,
      });
      if (res.code === 0 && res.data) {
        const data = (res as unknown as ApiResponse<FileListResponse>).data;
        const list = data.list || [];
        // 更新已加载文件ID缓存
        const newFileIds = new Set(loadedFileIds);
        list.forEach((file: FileInfo) => {
          newFileIds.add(file.id.toString());
        });
        setLoadedFileIds(newFileIds);

        // 转换 createTime 类型
        let convertedList = list.map((item: FileInfo) => ({
          ...item,
          createTime: item.createTime.toString(),
        }));

        // 如果是分享文件页面，对文件进行分组
        if (type === 8) {
          // 根据文件名中的分享路径进行分组
          const groupedFiles: { [key: string]: FileInfo[] } = {};
          convertedList.forEach((file: FileInfo) => {
            // 假设分享文件的名称格式为：分享/[shareKey]/filename
            const match = file.name.match(/^分享\/([^/]+)\//);
            if (match) {
              const shareKey = match[1];
              if (!groupedFiles[shareKey]) {
                groupedFiles[shareKey] = [];
              }
              groupedFiles[shareKey].push(file);
            }
          });

          // 转换为数组格式
          const groupedList = Object.entries(groupedFiles).map(
            ([shareKey, files]) => ({
              shareKey,
              files,
            })
          );

          setGroupedSharedFiles(groupedList);
        }

        // 如果没有指定排序，使用默认排序：文件夹在前，按名称排序
        if (!sortState.field) {
          convertedList = convertedList.sort((a: FileInfo, b: FileInfo) => {
            // 首先按类型排序（文件夹在前）
            if (a.type !== b.type) {
              return b.type === FileType.DIRECTORY ? 1 : -1;
            }
            // 然后按名称排序
            return a.name.localeCompare(b.name);
          });
        }

        setFileList(convertedList);
        setPagination({
          ...pagination,
          current: page,
          pageSize: size,
          total: data.total || 0,
        });
      } else {
        setFileList([]);
        setPagination({
          ...pagination,
          current: 1,
          pageSize: size,
          total: 0,
        });
        message.error(res.msg || "获取文件列表失败");
      }
    } catch (error) {
      setFileList([]);
      setPagination({
        ...pagination,
        current: 1,
        pageSize: size,
        total: 0,
      });
      message.error("获取文件列表失败");
      console.error("Load file list error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFileList(1, fileType);
  }, [currentPath, fileType]);

  // 初始化上传任务
  useEffect(() => {
    const uploadStore = useUploadStore.getState();
    uploadStore.initTasks();
  }, []);

  // 修改搜索处理函数
  const handleSearch = () => {
    if (!actionLoading) {
      loadFileList(1, fileType);
    }
  };

  // 处理分页变化
  const handlePageChange = (page: number, size: number) => {
    loadFileList(page, fileType, size);
  };

  // 处理每页条数变化
  const handlePageSizeChange = (_: number, size: number) => {
    loadFileList(1, fileType, size);
  };

  // 处理文件上传
  const handleFileUpload = async (fileList: File[] | RcFile[]) => {
    const fileArray = Array.from(fileList);
    const uploadStore = useUploadStore.getState();

    // 生成任务并添加到上传队列
    const tasks = fileArray.map((file) => {
      const taskId = `${file.name}-${Date.now()}-${Math.random()}`;
      return {
        id: taskId,
        file: file as File,
        catalogue: currentPath,
        deleteTask: () => handleDeleteUploadTask(taskId),
      };
    });

    // 添加任务到上传队列
    uploadStore.addTasks(tasks);

    message.success(`已添加 ${fileArray.length} 个文件到上传队列`);

    // 开始逐个上传文件
    for (const [index, file] of fileArray.entries()) {
      const task = tasks[index];
      try {
        const fileType = getFileTypeByExt(file.name);

        // 创建 FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);
        formData.append("type", fileType.toString());
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
          // 刷新文件列表
          loadFileList();
        } else {
          uploadStore.updateTaskStatus(
            task.id,
            "failed",
            res.msg || "上传失败"
          );
        }
      } catch (error) {
        uploadStore.updateTaskStatus(task.id, "failed", "上传失败");
        console.error("Upload error:", error);
      }
    }
  };

  // 处理新建文件夹
  const handleCreateFolder = async (values: { name: string }) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("type", FileType.DIRECTORY.toString());
      formData.append("catalogue", currentPath);

      const res = await createFile(formData);

      if (res.code === 0) {
        message.success("文件夹创建成功");
        setCreateFolderVisible(false);
        loadFileList();
      } else {
        message.error(res.msg || "文件夹创建失败");
      }
    } catch (error) {
      message.error("文件夹创建失败");
      console.error("Create folder error:", error);
    }
  };

  // 文件点击处理函数
  const handleFileClick = (record: FileInfo) => {
    if (record.type === FileType.DIRECTORY) {
      const newPath =
        currentPath === "/"
          ? `/${record.name}`
          : `${currentPath}/${record.name}`;
      setCurrentPath(newPath);
      localStorage.setItem("currentPath", newPath);
    } else {
      console.log("点击文件:", record.name);
    }
  };

  // 处理路径变化
  const handlePathChange = (newPath: string) => {
    setCurrentPath(newPath);
    localStorage.setItem("currentPath", newPath);
  };

  // 修改全选处理函数
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // 如果是全选，将当前页面的所有文件ID添加到已选中列表
      const currentPageIds = fileList.map((item) => item.id.toString());
      const newSelectedKeys = new Set([...selectedRowKeys, ...currentPageIds]);
      setSelectedRowKeys(Array.from(newSelectedKeys));
    } else {
      // 如果是取消全选，将当前页面的所有文件ID从已选中列表中移除
      const currentPageIds = new Set(
        fileList.map((item) => item.id.toString())
      );
      const newSelectedKeys = selectedRowKeys.filter(
        (key) => !currentPageIds.has(key)
      );
      setSelectedRowKeys(newSelectedKeys);
    }
  };

  // 处理单个选择
  const handleSelect = (checked: boolean, key: string) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, key]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== key));
    }
  };

  // 获取文件图标
  const getFileIcon = (type: FileType) => {
    switch (type) {
      case FileType.DIRECTORY:
        return <span className="folder-icon">📁</span>;
      case FileType.IMAGE:
        return <span className="image-icon">🖼️</span>;
      case FileType.AUDIO:
        return <span className="audio-icon">🎵</span>;
      case FileType.VIDEO:
        return <span className="video-icon">🎬</span>;
      case FileType.DOCUMENT:
        return <span className="document-icon">📄</span>;
      case FileType.PLANT:
        return <span className="plant-icon">🌱</span>;
      default:
        return <span className="file-icon">📎</span>;
    }
  };

  // 处理表格排序变化
  const handleTableChange = (
    _: any,
    __: any,
    sorter: SorterResult<FileInfo> | SorterResult<FileInfo>[]
  ) => {
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    setSortState({
      field: singleSorter.field as string,
      order: singleSorter.order as "ascend" | "descend" | null,
    });
    loadFileList(pagination.current, fileType);
  };

  // 修改下载文件的 API 调用部分
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

  // 修改单个文件下载的处理函数
  const handleSingleDownload = async (record: FileInfo) => {
    const downloadStore = useDownloadStore.getState();
    const taskId = `${record.name}-${Date.now()}-${Math.random()}`;

    // 创建下载任务
    const task = {
      id: taskId,
      file: {
        name: record.name,
        size: parseFloat(record.size || "0"),
        type: record.type,
      },
      status: "pending" as const,
      progress: 0,
      error: undefined,
      deleteTask: () => handleDeleteDownloadTask(taskId),
    };

    // 添加任务到下载队列
    downloadStore.addTasks([task]);
    message.success(`已添加 ${record.name} 到下载队列`);

    try {
      // 更新任务状态为下载中
      downloadStore.updateTaskStatus(taskId, "downloading");

      // 调用下载接口
      const response = await downloadFile(
        record.id.toString(),
        (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            downloadStore.updateTaskProgress(taskId, progress);
          }
        }
      );

      // 检查响应数据
      if (!response || !response.data) {
        throw new Error("下载失败：未收到文件数据");
      }

      // 获取文件名
      let filename = record.name;
      const contentDisposition = response.headers?.["content-disposition"];
      if (contentDisposition) {
        const matches = /filename\*=UTF-8''(.+)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1]);
        }
      }

      // 创建 Blob URL 并触发下载
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

      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      // 更新任务状态为已完成
      downloadStore.updateTaskStatus(taskId, "downloaded");
    } catch (error) {
      console.error("Download error:", error);
      downloadStore.updateTaskStatus(
        taskId,
        "failed",
        error instanceof Error ? error.message : "下载失败"
      );
    }
  };

  // 处理单个文件分享
  const handleSingleShare = async (record: FileInfo) => {
    try {
      setActionLoading(true);
      const res = await shareFile(record.id.toString());
      if (res.code === 0) {
        message.success("分享成功");
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "分享失败");
      }
    } catch (error) {
      message.error("分享失败");
      console.error("Share error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // 添加获取文件夹内容的函数
  const getFolderContents = async (
    folderId: string,
    folderPath: string
  ): Promise<FileInfo[]> => {
    const files: FileInfo[] = [];
    const pageSize = 100; // 设置为最大允许值
    let currentPage = 1;
    let totalItems = 0;

    try {
      do {
        const response = await getFileList({
          catalogue: folderPath,
          pageNo: currentPage,
          pageSize: pageSize,
        });

        const res = response as unknown as ApiResponse<FileListResponse>;

        if (res.code === 0 && res.data?.list) {
          // 更新总数，用于计算是否需要继续请求
          totalItems = res.data.total;

          // 处理当前页的文件
          for (const file of res.data.list) {
            if (file.type === FileType.DIRECTORY) {
              // 如果是文件夹，递归获取其内容
              const subFiles = await getFolderContents(
                file.id.toString(),
                `${folderPath === "/" ? "" : folderPath}/${file.name}`
              );
              files.push(...subFiles);
            } else {
              files.push(file);
            }
          }

          // 增加页码
          currentPage++;
        } else {
          break; // 如果请求失败，退出循环
        }
      } while ((currentPage - 1) * pageSize < totalItems); // 继续获取直到所有文件都被处理
    } catch (error) {
      console.error(`获取文件夹内容失败: ${error}`);
      message.error(`获取文件夹 ${folderPath} 内容失败`);
    }
    return files;
  };

  // 修改批量下载的处理函数
  const handleBatchDownload = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要下载的文件");
      return;
    }

    const downloadStore = useDownloadStore.getState();

    try {
      // 获取所有选中文件的信息
      const allSelectedFiles: FileInfo[] = [];
      const pageSize = 100;
      const totalPages = Math.ceil(selectedRowKeys.length / pageSize);

      // 检查是否包含文件夹
      let hasDirectory = false;
      for (let page = 1; page <= totalPages; page++) {
        const response = await getFileList({
          catalogue: fileType === undefined ? currentPath : undefined,
          type: fileType,
          pageNo: page,
          pageSize: pageSize,
          name: searchKeyword,
          sortField: sortState.field || undefined,
          sortOrder: sortState.order || undefined,
        });

        const res = response as unknown as ApiResponse<FileListResponse>;

        if (res.code === 0 && res.data?.list) {
          const pageFiles = res.data.list.filter((file: FileInfo) =>
            selectedRowKeys.includes(file.id.toString())
          );

          // 检查是否有文件夹
          if (pageFiles.some((file) => file.type === FileType.DIRECTORY)) {
            hasDirectory = true;
            break;
          }
        }
      }

      // 如果包含文件夹，显示加载动画
      if (hasDirectory) {
        setActionLoading(true);
      }

      // 重新获取所有文件，包括文件夹内容
      for (let page = 1; page <= totalPages; page++) {
        const response = await getFileList({
          catalogue: fileType === undefined ? currentPath : undefined,
          type: fileType,
          pageNo: page,
          pageSize: pageSize,
          name: searchKeyword,
          sortField: sortState.field || undefined,
          sortOrder: sortState.order || undefined,
        });

        const res = response as unknown as ApiResponse<FileListResponse>;

        if (res.code === 0 && res.data?.list) {
          const pageFiles = res.data.list.filter((file: FileInfo) =>
            selectedRowKeys.includes(file.id.toString())
          );

          // 对每个文件/文件夹进行处理
          for (const file of pageFiles) {
            if (file.type === FileType.DIRECTORY) {
              // 如果是文件夹，递归获取其中的所有文件
              const folderPath = `${currentPath === "/" ? "" : currentPath}/${
                file.name
              }`;
              const folderFiles = await getFolderContents(
                file.id.toString(),
                folderPath
              );
              allSelectedFiles.push(...folderFiles);
            } else {
              allSelectedFiles.push(file);
            }
          }
        }
      }

      // 如果之前显示了加载动画，现在关闭它
      if (hasDirectory) {
        setActionLoading(false);
      }

      // 生成下载任务
      const tasks = allSelectedFiles.map((file) => {
        const taskId = `${file.name}-${Date.now()}-${Math.random()}`;
        const sizeInMB = file.size ? parseFloat(file.size) : 0;
        const sizeInBytes = sizeInMB * 1024 * 1024;

        return {
          id: taskId,
          file: {
            name: file.name,
            size: sizeInBytes,
            type: file.type,
          },
          status: "pending" as const,
          progress: 0,
          error: undefined,
          deleteTask: () => handleDeleteDownloadTask(taskId),
        };
      });

      // 添加任务到下载队列
      downloadStore.addTasks(tasks);
      message.success(`已添加 ${tasks.length} 个文件到下载队列`);

      // 开始逐个下载文件
      for (const [index, file] of allSelectedFiles.entries()) {
        const task = tasks[index];
        try {
          downloadStore.updateTaskStatus(task.id, "downloading");

          const response = await downloadFile(
            file.id.toString(),
            (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded / progressEvent.total) * 100
                );
                downloadStore.updateTaskProgress(task.id, progress);
              }
            }
          );

          if (!response || !response.data) {
            throw new Error("下载失败：未收到文件数据");
          }

          // 获取文件名，保留文件夹结构
          let filename = file.name;
          if (filename.includes("/")) {
            filename = filename.split("/").pop() || filename;
          }

          const blob = new Blob([response.data], {
            type:
              response.headers?.["content-type"] || "application/octet-stream",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();

          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 100);

          downloadStore.updateTaskStatus(task.id, "downloaded");

          if (index < allSelectedFiles.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error("Download error:", error);
          downloadStore.updateTaskStatus(
            task.id,
            "failed",
            error instanceof Error ? error.message : "下载失败"
          );
        }
      }
    } catch (error) {
      console.error("Batch download error:", error);
      message.error("批量下载失败");
      // 确保加载动画被关闭
      setActionLoading(false);
    }
  };

  // 修改批量分享的处理函数
  const handleBatchShare = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要分享的文件");
      return;
    }

    try {
      setActionLoading(true);
      const res = await batchShareFiles(selectedRowKeys);
      if (res.code === 0) {
        message.success(`成功分享 ${selectedRowKeys.length} 个文件`);
        setSelectedRowKeys([]);
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "批量分享失败");
      }
    } catch (error) {
      message.error("批量分享失败");
      console.error("Batch share error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // 处理单个文件取消分享
  const handleCancelShare = async (record: FileInfo) => {
    try {
      setActionLoading(true);
      const res = await cancelShare(record.id.toString());
      if (res.code === 0) {
        message.success("取消分享成功");
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "取消分享失败");
      }
    } catch (error) {
      message.error("取消分享失败");
      console.error("Cancel share error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // 处理批量取消分享
  const handleBatchCancelShare = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要取消分享的文件");
      return;
    }

    try {
      setActionLoading(true);
      for (const id of selectedRowKeys) {
        const res = await cancelShare(id);
        if (res.code !== 0) {
          message.error(`取消分享文件(ID: ${id})失败: ${res.msg}`);
        }
      }

      message.success("批量取消分享完成");
      setSelectedRowKeys([]);
      loadFileList(pagination.current, fileType);
    } catch (error) {
      message.error("批量取消分享失败");
      console.error("Batch cancel share error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // 添加删除上传任务的处理函数
  const handleDeleteUploadTask = (taskId: string) => {
    const uploadStore = useUploadStore.getState();
    uploadStore.removeTask(taskId);
    message.success("已删除上传任务");
  };

  // 添加删除下载任务的处理函数
  const handleDeleteDownloadTask = (taskId: string) => {
    const downloadStore = useDownloadStore.getState();
    downloadStore.removeTask(taskId);
    message.success("已删除下载任务");
  };

  // 处理单个文件删除
  const handleSingleDelete = async (record: FileInfo) => {
    try {
      setActionLoading(true);
      const res = await deleteFile(record.id.toString());
      if (res.code === 0) {
        message.success("删除成功");
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "删除失败");
      }
    } catch (error) {
      message.error("删除失败");
      console.error("Delete error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要删除的文件");
      return;
    }

    try {
      setActionLoading(true);
      for (const id of selectedRowKeys) {
        const res = await deleteFile(id);
        if (res.code !== 0) {
          message.error(`删除文件(ID: ${id})失败: ${res.msg}`);
        }
      }

      message.success("批量删除完成");
      setSelectedRowKeys([]);
      loadFileList(pagination.current, fileType);
    } catch (error) {
      message.error("批量删除失败");
      console.error("Batch delete error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // 在API调用部分添加恢复文件的方法
  const restoreFile = (id: string): Promise<ApiResponse<void>> => {
    return request.post(`/admin-api/system/hadoop-file/restore?id=${id}`);
  };

  // 添加恢复文件的处理函数
  const handleSingleRestore = async (record: FileInfo) => {
    try {
      setActionLoading(true);
      const res = await restoreFile(record.id.toString());
      if (res.code === 0) {
        message.success("文件恢复成功");
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "文件恢复失败");
      }
    } catch (error) {
      message.error("文件恢复失败");
      console.error("Restore error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // 添加批量恢复的处理函数
  const handleBatchRestore = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要恢复的文件");
      return;
    }

    try {
      setActionLoading(true);
      for (const id of selectedRowKeys) {
        const res = await restoreFile(id);
        if (res.code !== 0) {
          message.error(`恢复文件(ID: ${id})失败: ${res.msg}`);
        }
      }

      message.success("批量恢复完成");
      setSelectedRowKeys([]);
      loadFileList(pagination.current, fileType);
    } catch (error) {
      message.error("批量恢复失败");
      console.error("Batch restore error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // 添加复制链接函数
  const copyShareLink = (shareKey: string) => {
    const shareUrl = `${baseUrl}/share/${shareKey}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        message.success("分享链接已复制到剪贴板");
      })
      .catch(() => {
        message.error("复制失败，请手动复制");
      });
  };

  // 表格列定义
  const columns = [
    {
      title: (
        <div className="file-name-header" onClick={(e) => e.stopPropagation()}>
          {fileType === 8 ? null : (
            <Checkbox
              checked={
                fileList.length > 0 &&
                fileList.every((item) =>
                  selectedRowKeys.includes(item.id.toString())
                )
              }
              indeterminate={
                fileList.some((item) =>
                  selectedRowKeys.includes(item.id.toString())
                ) &&
                !fileList.every((item) =>
                  selectedRowKeys.includes(item.id.toString())
                )
              }
              onChange={(e) => {
                e.stopPropagation();
                if (!actionLoading) {
                  handleSelectAll(e.target.checked);
                }
              }}
              disabled={actionLoading}
            />
          )}
          <span>文件名</span>
          {viewType === "list" && selectedRowKeys.length > 0 && (
            <span className="selected-count">
              已选择 {selectedRowKeys.length} 个文件
            </span>
          )}
        </div>
      ),
      dataIndex: "name",
      key: "name",
      width: 500,
      ellipsis: true,
      sorter: true,
      render: (text: string, record: FileInfo) => {
        if (fileType === 8) {
          const actualName = text.split("/").pop() || text;
          return (
            <div className="file-name-cell">
              <Checkbox
                checked={selectedRowKeys.includes(record.id.toString())}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  !actionLoading &&
                  handleSelect(e.target.checked, record.id.toString())
                }
                disabled={actionLoading}
              />
              <div
                className={`file-name-content ${
                  actionLoading ? "disabled" : ""
                }`}
              >
                {getFileIcon(record.type)}
                <span className="file-name-text">{actualName}</span>
                <div className="file-actions">
                  <Button
                    type="link"
                    icon={<UndoOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!actionLoading) {
                        handleCancelShare(record);
                      }
                    }}
                    disabled={actionLoading}
                    loading={actionLoading}
                    className={actionLoading ? "disabled" : ""}
                  >
                    取消分享
                  </Button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="file-name-cell">
            <Checkbox
              checked={selectedRowKeys.includes(record.id.toString())}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                !actionLoading &&
                handleSelect(e.target.checked, record.id.toString())
              }
              disabled={actionLoading}
            />
            <div
              className={`file-name-content ${actionLoading ? "disabled" : ""}`}
              onClick={() => !actionLoading && handleFileClick(record)}
            >
              {getFileIcon(record.type)}
              <span className="file-name-text">{text}</span>
              <div className="file-actions">
                {fileType === 7 ? (
                  <Button
                    type="link"
                    icon={<UndoOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!actionLoading) {
                        handleSingleRestore(record);
                      }
                    }}
                    disabled={actionLoading}
                    loading={actionLoading}
                    className={actionLoading ? "disabled" : ""}
                  >
                    恢复
                  </Button>
                ) : (
                  <>
                    <Button
                      type="link"
                      icon={<CloudDownloadOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!actionLoading) {
                          handleSingleDownload(record);
                        }
                      }}
                      disabled={actionLoading}
                      className={actionLoading ? "disabled" : ""}
                    >
                      下载
                    </Button>
                    <Button
                      type="link"
                      icon={<ShareAltOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!actionLoading) {
                          handleSingleShare(record);
                        }
                      }}
                      disabled={actionLoading}
                      loading={actionLoading}
                      className={actionLoading ? "disabled" : ""}
                    >
                      分享
                    </Button>
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!actionLoading) {
                          handleSingleDelete(record);
                        }
                      }}
                      disabled={actionLoading}
                      loading={actionLoading}
                      className={actionLoading ? "disabled" : ""}
                    >
                      删除
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (type: FileType) => FileTypeMap[type],
    },
    {
      title: "大小",
      dataIndex: "size",
      key: "size",
      sorter: true,
      render: (size: string | null) => (size ? `${size} MB` : "-"),
    },
    {
      title: "修改日期",
      dataIndex: "createTime",
      key: "createTime",
      sorter: true,
      render: (time: number) => formatDateTime(time),
    },
  ];

  // 添加清除所有选择的函数
  const clearSelection = () => {
    setSelectedRowKeys([]);
  };

  // 在搜索和切换文件类型时清除选择
  useEffect(() => {
    clearSelection();
  }, [fileType, searchKeyword]);

  return (
    <Content
      className={`content-main ${actionLoading ? "loading" : ""} ${viewType}`}
    >
      <div className="operation-bar">
        <div className="left-buttons">
          {fileType === 7 ? (
            selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                icon={<UndoOutlined />}
                onClick={handleBatchRestore}
                disabled={actionLoading}
                loading={actionLoading}
              >
                恢复{" "}
                {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
              </Button>
            )
          ) : fileType === 8 ? (
            selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                icon={<UndoOutlined />}
                onClick={handleBatchCancelShare}
                disabled={actionLoading}
                loading={actionLoading}
              >
                取消分享{" "}
                {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
              </Button>
            )
          ) : (
            <>
              <Upload
                multiple
                showUploadList={false}
                beforeUpload={(file, fileList) => {
                  if (file === fileList[0] && !actionLoading) {
                    handleFileUpload(fileList);
                  }
                  return false;
                }}
                disabled={
                  fileType !== undefined ||
                  selectedRowKeys.length > 0 ||
                  actionLoading
                }
              >
                <Button
                  type="primary"
                  disabled={
                    fileType !== undefined ||
                    selectedRowKeys.length > 0 ||
                    actionLoading
                  }
                  icon={<UploadOutlined />}
                >
                  上传
                </Button>
              </Upload>
              <Button
                icon={<FolderAddOutlined />}
                onClick={() => !actionLoading && setCreateFolderVisible(true)}
                disabled={
                  fileType !== undefined ||
                  selectedRowKeys.length > 0 ||
                  actionLoading
                }
              >
                新建文件夹
              </Button>
              {selectedRowKeys.length > 0 && (
                <>
                  <Button
                    type="primary"
                    icon={<CloudDownloadOutlined />}
                    onClick={handleBatchDownload}
                    disabled={actionLoading}
                    loading={actionLoading}
                  >
                    下载{" "}
                    {selectedRowKeys.length > 0 &&
                      `(${selectedRowKeys.length})`}
                  </Button>
                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={handleBatchShare}
                    disabled={actionLoading}
                    loading={actionLoading}
                  >
                    分享{" "}
                    {selectedRowKeys.length > 0 &&
                      `(${selectedRowKeys.length})`}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBatchDelete}
                    disabled={actionLoading}
                    loading={actionLoading}
                  >
                    删除{" "}
                    {selectedRowKeys.length > 0 &&
                      `(${selectedRowKeys.length})`}
                  </Button>
                </>
              )}
            </>
          )}
          {viewType === "grid" && selectedRowKeys.length > 0 && (
            <span className="selected-count">
              已选择 {selectedRowKeys.length} 个文件
            </span>
          )}
        </div>
        <div className="right-search">
          <Input
            placeholder="搜索您的文件"
            prefix={<SearchOutlined />}
            className="search-input"
            value={searchKeyword}
            onChange={(e) => !actionLoading && setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
            disabled={actionLoading}
          />
          <div className="view-switch">
            <BarsOutlined
              className={viewType === "list" ? "active" : ""}
              onClick={() => !actionLoading && setViewType("list")}
            />
            <AppstoreOutlined
              className={viewType === "grid" ? "active" : ""}
              onClick={() => !actionLoading && setViewType("grid")}
            />
          </div>
        </div>
      </div>
      {fileType === undefined && (
        <BreadcrumbNav
          onPathChange={handlePathChange}
          currentPath={currentPath}
        />
      )}
      <div className="table-header">
        <div className="left">
          {fileType === undefined
            ? "全部文件"
            : FileTypeMap[fileType] || "未知类型"}
        </div>
        <div className="right">
          已加载 {fileList?.length || 0} 条，共 {pagination?.total || 0} 个
        </div>
      </div>
      <div className="table-container">
        {fileType === 8 ? (
          <div className="shared-files-container">
            {groupedSharedFiles.map((group) => (
              <div key={group.shareKey} className="shared-group">
                <div className="shared-group-header">
                  <div className="header-left">
                    <Checkbox
                      checked={
                        group.files.length > 0 &&
                        group.files.every((file) =>
                          selectedRowKeys.includes(file.id.toString())
                        )
                      }
                      indeterminate={
                        group.files.some((file) =>
                          selectedRowKeys.includes(file.id.toString())
                        ) &&
                        !group.files.every((file) =>
                          selectedRowKeys.includes(file.id.toString())
                        )
                      }
                      onChange={(e) => {
                        if (!actionLoading) {
                          const fileIds = group.files.map((file) =>
                            file.id.toString()
                          );
                          if (e.target.checked) {
                            // 添加当前分享文件夹中未选中的文件
                            const newSelectedKeys = [
                              ...selectedRowKeys,
                              ...fileIds.filter(
                                (id) => !selectedRowKeys.includes(id)
                              ),
                            ];
                            setSelectedRowKeys(newSelectedKeys);
                          } else {
                            // 移除当前分享文件夹中的所有文件
                            const newSelectedKeys = selectedRowKeys.filter(
                              (id) => !fileIds.includes(id)
                            );
                            setSelectedRowKeys(newSelectedKeys);
                          }
                        }
                      }}
                      disabled={actionLoading}
                    />
                    <h3>分享文件夹 {group.shareKey}</h3>
                  </div>
                  <div className="share-actions">
                    <div className="share-link">
                      分享链接：{`${baseUrl}/share/${group.shareKey}`}
                    </div>
                    <Button
                      type="link"
                      icon={<CopyOutlined />}
                      onClick={() => copyShareLink(group.shareKey)}
                    >
                      复制链接
                    </Button>
                  </div>
                </div>
                <Table
                  columns={columns}
                  dataSource={group.files}
                  pagination={false}
                  showHeader={true}
                  loading={loading}
                  rowKey="id"
                  onChange={handleTableChange}
                />
              </div>
            ))}
          </div>
        ) : viewType === "list" ? (
          <Table
            columns={columns}
            dataSource={fileList}
            pagination={false}
            showHeader={true}
            loading={loading}
            rowKey="id"
            onChange={handleTableChange}
          />
        ) : (
          <div className="grid-view">
            {fileList.map((file) => (
              <div
                key={file.id}
                className={`grid-item ${
                  selectedRowKeys.includes(file.id.toString()) ? "selected" : ""
                }`}
                onClick={() => !actionLoading && handleFileClick(file)}
              >
                <div className="grid-item-checkbox">
                  <Checkbox
                    checked={selectedRowKeys.includes(file.id.toString())}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!actionLoading) {
                        handleSelect(
                          !selectedRowKeys.includes(file.id.toString()),
                          file.id.toString()
                        );
                      }
                    }}
                    disabled={actionLoading}
                  />
                </div>
                <div className="grid-item-icon">{getFileIcon(file.type)}</div>
                <div className="grid-item-name" title={file.name}>
                  {file.name}
                </div>
                <div className="grid-item-info">
                  <span>{file.size ? `${file.size} MB` : "-"}</span>
                  <span>{formatDateTime(Number(file.createTime))}</span>
                </div>
                <div className="grid-item-actions">
                  {fileType === 7 ? (
                    <Button
                      type="link"
                      icon={<UndoOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!actionLoading) {
                          handleSingleRestore(file);
                        }
                      }}
                      disabled={actionLoading}
                      loading={actionLoading}
                    >
                      恢复
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="link"
                        icon={<CloudDownloadOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!actionLoading) {
                            handleSingleDownload(file);
                          }
                        }}
                        disabled={actionLoading}
                      >
                        下载
                      </Button>
                      <Button
                        type="link"
                        icon={<ShareAltOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!actionLoading) {
                            handleSingleShare(file);
                          }
                        }}
                        disabled={actionLoading}
                        loading={actionLoading}
                      >
                        分享
                      </Button>
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!actionLoading) {
                            handleSingleDelete(file);
                          }
                        }}
                        disabled={actionLoading}
                        loading={actionLoading}
                      >
                        删除
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        className="pagination-container"
        style={{ textAlign: "right", marginTop: "16px" }}
      >
        <Pagination
          current={pagination.current}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onChange={handlePageChange}
          onShowSizeChange={handlePageSizeChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `共 ${total} 条`}
        />
      </div>
      <CreateFolderModal
        visible={createFolderVisible}
        onCancel={() => setCreateFolderVisible(false)}
        onSubmit={handleCreateFolder}
      />

      {actionLoading && (
        <div className="global-loading-wrapper">
          <Spin indicator={antIcon} tip="正在处理..." />
        </div>
      )}
    </Content>
  );
};

export default DiskContent;
