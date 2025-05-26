import {
  Layout,
  Button,
  Input,
  Table,
  Checkbox,
  Upload,
  message,
  Pagination,
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

  const location = useLocation();
  const baseUrl = window.location.origin;

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
        excludeShared: type !== 8, // 如果不是分享页面，则排除已分享的文件
      });
      if (res.code === 0 && res.data) {
        const data = (res as unknown as ApiResponse<FileListResponse>).data;
        const list = data.list || [];
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

  // 处理搜索
  const handleSearch = () => {
    loadFileList(1, fileType);
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

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(fileList.map((item) => item.id.toString()));
    } else {
      setSelectedRowKeys([]);
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

  // 处理批量下载
  const handleBatchDownload = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要下载的文件");
      return;
    }

    const downloadStore = useDownloadStore.getState();
    const selectedFiles = fileList.filter((file) =>
      selectedRowKeys.includes(file.id.toString())
    );

    // 生成下载任务
    const tasks = selectedFiles.map((file) => {
      const taskId = `${file.name}-${Date.now()}-${Math.random()}`;
      return {
        id: taskId,
        file: {
          name: file.name,
          size: parseFloat(file.size || "0"),
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
    for (const [index, file] of selectedFiles.entries()) {
      const task = tasks[index];
      try {
        // 更新任务状态为下载中
        downloadStore.updateTaskStatus(task.id, "downloading");

        // 调用下载接口
        const response = await downloadFile({
          fileId: file.id.toString(),
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              downloadStore.updateTaskProgress(task.id, progress);
            }
          },
        });

        // 检查响应数据
        if (!response.data) {
          throw new Error("下载失败：未收到文件数据");
        }

        // 获取文件名
        let filename = file.name;
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
          const matches = /filename\*=UTF-8''(.+)/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = decodeURIComponent(matches[1]);
          }
        }

        // 创建下载链接并触发下载
        const url = window.URL.createObjectURL(response.data);
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
        downloadStore.updateTaskStatus(task.id, "downloaded");

        // 等待一小段时间再开始下一个文件的下载
        if (index < selectedFiles.length - 1) {
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
  };

  // 处理单个文件分享
  const handleSingleShare = async (record: FileInfo) => {
    try {
      const res = await shareFile(record.id.toString());
      if (res.code === 0) {
        message.success("分享成功");
        // 刷新文件列表
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "分享失败");
      }
    } catch (error) {
      message.error("分享失败");
      console.error("Share error:", error);
    }
  };

  // 处理批量分享
  const handleBatchShare = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要分享的文件");
      return;
    }

    try {
      const res = await batchShareFiles(selectedRowKeys);
      if (res.code === 0) {
        message.success("批量分享成功");
        // 清空选中状态
        setSelectedRowKeys([]);
        // 刷新文件列表
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "批量分享失败");
      }
    } catch (error) {
      message.error("批量分享失败");
      console.error("Batch share error:", error);
    }
  };

  // 处理单个文件取消分享
  const handleCancelShare = async (record: FileInfo) => {
    try {
      const res = await cancelShare(record.id.toString());
      if (res.code === 0) {
        message.success("取消分享成功");
        // 刷新文件列表
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "取消分享失败");
      }
    } catch (error) {
      message.error("取消分享失败");
      console.error("Cancel share error:", error);
    }
  };

  // 处理批量取消分享
  const handleBatchCancelShare = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要取消分享的文件");
      return;
    }

    try {
      // 逐个取消分享选中的文件
      for (const id of selectedRowKeys) {
        const res = await cancelShare(id);
        if (res.code !== 0) {
          message.error(`取消分享文件(ID: ${id})失败: ${res.msg}`);
        }
      }

      message.success("批量取消分享完成");
      // 清空选中状态
      setSelectedRowKeys([]);
      // 刷新文件列表
      loadFileList(pagination.current, fileType);
    } catch (error) {
      message.error("批量取消分享失败");
      console.error("Batch cancel share error:", error);
    }
  };

  // 修改删除处理函数
  const handleDeleteUploadTask = (taskId: string) => {
    const uploadStore = useUploadStore.getState();
    uploadStore.removeTask(taskId);
    message.success("已删除上传任务");
  };

  const handleDeleteDownloadTask = (taskId: string) => {
    const downloadStore = useDownloadStore.getState();
    downloadStore.removeTask(taskId);
    message.success("已删除下载任务");
  };

  // 处理单个文件下载
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
      const response = (await downloadFile({
        fileId: record.id.toString(),
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            downloadStore.updateTaskProgress(taskId, progress);
          }
        },
      })) as DownloadResponse;

      // 检查响应数据
      if (!response.data) {
        throw new Error("下载失败：未收到文件数据");
      }

      // 获取文件名
      let filename = record.name;
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const matches = /filename\*=UTF-8''(.+)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1]);
        }
      }

      // 创建下载链接并触发下载
      const url = window.URL.createObjectURL(response.data);
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

  // 处理单个文件删除
  const handleSingleDelete = async (record: FileInfo) => {
    try {
      const res = await deleteFile(record.id.toString());
      if (res.code === 0) {
        message.success("删除成功");
        // 刷新文件列表
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "删除失败");
      }
    } catch (error) {
      message.error("删除失败");
      console.error("Delete error:", error);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要删除的文件");
      return;
    }

    try {
      // 逐个删除选中的文件
      for (const id of selectedRowKeys) {
        const res = await deleteFile(id);
        if (res.code !== 0) {
          message.error(`删除文件(ID: ${id})失败: ${res.msg}`);
        }
      }

      message.success("批量删除完成");
      // 清空选中状态
      setSelectedRowKeys([]);
      // 刷新文件列表
      loadFileList(pagination.current, fileType);
    } catch (error) {
      message.error("批量删除失败");
      console.error("Batch delete error:", error);
    }
  };

  // 在API调用部分添加恢复文件的方法
  const restoreFile = (id: string): Promise<ApiResponse<void>> => {
    return request.post(`/admin-api/system/hadoop-file/restore?id=${id}`);
  };

  // 添加恢复文件的处理函数
  const handleSingleRestore = async (record: FileInfo) => {
    try {
      const res = await restoreFile(record.id.toString());
      if (res.code === 0) {
        message.success("文件恢复成功");
        // 刷新文件列表
        loadFileList(pagination.current, fileType);
      } else {
        message.error(res.msg || "文件恢复失败");
      }
    } catch (error) {
      message.error("文件恢复失败");
      console.error("Restore error:", error);
    }
  };

  // 添加批量恢复的处理函数
  const handleBatchRestore = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要恢复的文件");
      return;
    }

    try {
      // 逐个恢复选中的文件
      for (const id of selectedRowKeys) {
        const res = await restoreFile(id);
        if (res.code !== 0) {
          message.error(`恢复文件(ID: ${id})失败: ${res.msg}`);
        }
      }

      message.success("批量恢复完成");
      // 清空选中状态
      setSelectedRowKeys([]);
      // 刷新文件列表
      loadFileList(pagination.current, fileType);
    } catch (error) {
      message.error("批量恢复失败");
      console.error("Batch restore error:", error);
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
          <Checkbox
            checked={
              fileList.length > 0 && selectedRowKeys.length === fileList.length
            }
            indeterminate={
              selectedRowKeys.length > 0 &&
              selectedRowKeys.length < fileList.length
            }
            onChange={(e) => {
              e.stopPropagation();
              handleSelectAll(e.target.checked);
            }}
          />
          <span>文件名</span>
        </div>
      ),
      dataIndex: "name",
      key: "name",
      width: 500,
      ellipsis: true,
      sorter: true,
      render: (text: string, record: FileInfo) => {
        // 如果是分享页面，特殊处理显示方式
        if (fileType === 8) {
          // 从文件名中提取实际文件名（去掉分享路径前缀）
          const actualName = text.split("/").pop() || text;
          return (
            <div className="file-name-cell">
              <Checkbox
                checked={selectedRowKeys.includes(record.id.toString())}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  handleSelect(e.target.checked, record.id.toString())
                }
              />
              <div className="file-name-content">
                {getFileIcon(record.type)}
                <span className="file-name-text">{actualName}</span>
                <div className="file-actions">
                  <UndoOutlined
                    className="action-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelShare(record);
                    }}
                  />
                </div>
              </div>
            </div>
          );
        }

        // 非分享页面保持原有渲染逻辑
        return (
          <div className="file-name-cell">
            <Checkbox
              checked={selectedRowKeys.includes(record.id.toString())}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                handleSelect(e.target.checked, record.id.toString())
              }
            />
            <div
              className="file-name-content"
              onClick={() => handleFileClick(record)}
            >
              {getFileIcon(record.type)}
              <span className="file-name-text">{text}</span>
              <div className="file-actions">
                {fileType === 7 ? (
                  <UndoOutlined
                    className="action-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSingleRestore(record);
                    }}
                  />
                ) : (
                  <>
                    <CloudDownloadOutlined
                      className="action-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSingleDownload(record);
                      }}
                    />
                    <ShareAltOutlined
                      className="action-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSingleShare(record);
                      }}
                    />
                    <DeleteOutlined
                      className="action-icon danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSingleDelete(record);
                      }}
                    />
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

  return (
    <Content className="content-main">
      <div className="operation-bar">
        <div className="left-buttons">
          {fileType === 7 ? (
            selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                icon={<UndoOutlined />}
                onClick={handleBatchRestore}
              >
                恢复
              </Button>
            )
          ) : fileType === 8 ? (
            selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                icon={<UndoOutlined />}
                onClick={handleBatchCancelShare}
              >
                取消分享
              </Button>
            )
          ) : (
            <>
              <Upload
                multiple
                showUploadList={false}
                beforeUpload={(file, fileList) => {
                  if (file === fileList[0]) {
                    handleFileUpload(fileList);
                  }
                  return false;
                }}
                disabled={fileType !== undefined || selectedRowKeys.length > 0}
              >
                <Button
                  type="primary"
                  disabled={
                    fileType !== undefined || selectedRowKeys.length > 0
                  }
                  icon={<UploadOutlined />}
                >
                  上传
                </Button>
              </Upload>
              <Button
                icon={<FolderAddOutlined />}
                onClick={() => setCreateFolderVisible(true)}
                disabled={fileType !== undefined || selectedRowKeys.length > 0}
              >
                新建文件夹
              </Button>
            </>
          )}
          {selectedRowKeys.length > 0 && fileType !== 7 && fileType !== 8 && (
            <>
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                onClick={handleBatchDownload}
              >
                下载
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={handleBatchShare}>
                分享
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              >
                删除
              </Button>
            </>
          )}
        </div>
        <div className="right-search">
          <Input
            placeholder="搜索您的文件"
            prefix={<SearchOutlined />}
            className="search-input"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={handleSearch}
          />
          <div className="view-switch">
            <BarsOutlined className="active" />
            <AppstoreOutlined />
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
                  <h3>分享文件夹 {group.shareKey}</h3>
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
        ) : (
          <Table
            columns={columns}
            dataSource={fileList}
            pagination={false}
            showHeader={true}
            loading={loading}
            rowKey="id"
            onChange={handleTableChange}
          />
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
    </Content>
  );
};

export default DiskContent;
