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
  SettingOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import "../layout/style/content-main.scss";
import BreadcrumbNav from "./BreadcrumbNav";
import CreateFolderModal from "./CreateFolderModal";
import { FileType, FileTypeMap, getFileTypeByExt } from "../enums/FileTypeEnum";
import { createFile, getFileList } from "@/api/file";
import { FileInfo } from "@/types/file";
import { useUploadStore } from "@/store/uploadStore";
import dayjs from "dayjs";

const { Content } = Layout;

interface DiskContentProps {
  fileType: FileType | undefined;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
}

// 在组件外部定义格式化函数
const formatDateTime = (timestamp: number): string => {
  if (!timestamp) return "-";
  // 如果是13位时间戳，需要除以1000转换为正确的时间
  const normalizedTimestamp =
    String(timestamp).length === 13 ? timestamp / 1000 : timestamp;
  return dayjs(normalizedTimestamp * 1000).format("YYYY-MM-DD HH:mm:ss");
};

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

  // 加载文件列表
  const loadFileList = async (
    page = 1,
    type: FileType | undefined = undefined
  ) => {
    try {
      setLoading(true);
      const res = await getFileList({
        catalogue: type === undefined ? currentPath : undefined,
        type,
        name: searchKeyword,
        pageNo: page,
        pageSize: pagination.pageSize,
        sortField: sortState.field,
        sortOrder: sortState.order,
      });
      if (res.code === 0 && res.data) {
        const list = res.data.list || [];
        // 转换 createTime 类型
        let convertedList = list.map((item) => ({
          ...item,
          createTime: item.createTime.toString(),
        }));

        // 如果没有指定排序，使用默认排序：文件夹在前，按名称排序
        if (!sortState.field) {
          convertedList = convertedList.sort((a, b) => {
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
          total: res.data.total || 0,
        });
      } else {
        setFileList([]);
        setPagination({
          ...pagination,
          current: 1,
          total: 0,
        });
        message.error(res.msg || "获取文件列表失败");
      }
    } catch (error) {
      setFileList([]);
      setPagination({
        ...pagination,
        current: 1,
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
  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination({ ...pagination, current: page, pageSize: pageSize || 10 });
    loadFileList(page, fileType);
  };

  // 处理文件上传
  const handleFileUpload = async (fileList: File[] | RcFile[]) => {
    const fileArray = Array.from(fileList);
    const uploadStore = useUploadStore.getState();

    // 生成任务并添加到上传队列
    const tasks = fileArray.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file: file as File,
      catalogue: currentPath,
    }));

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

  // 表格列定义
  const columns = [
    {
      title: (
        <div className="file-name-header">
          <Checkbox
            checked={
              fileList.length > 0 && selectedRowKeys.length === fileList.length
            }
            indeterminate={
              selectedRowKeys.length > 0 &&
              selectedRowKeys.length < fileList.length
            }
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span>文件名</span>
        </div>
      ),
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text: string, record: FileInfo) => (
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
          </div>
        </div>
      ),
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
          <Upload
            multiple
            showUploadList={false}
            beforeUpload={(file, fileList) => {
              // 只在完整的文件列表上传时处理
              if (file === fileList[0]) {
                handleFileUpload(fileList);
              }
              return false;
            }}
            disabled={fileType !== undefined}
          >
            <Button
              type="primary"
              disabled={fileType !== undefined}
              icon={<UploadOutlined />}
            >
              上传
            </Button>
          </Upload>
          <Button
            icon={<FolderAddOutlined />}
            onClick={() => setCreateFolderVisible(true)}
            disabled={fileType !== undefined}
          >
            新建文件夹
          </Button>
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
        <Table
          columns={columns}
          dataSource={fileList || []}
          pagination={false}
          showHeader={true}
          loading={loading}
          rowKey="id"
          onChange={handleTableChange}
        />
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
