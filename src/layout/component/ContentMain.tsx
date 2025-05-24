import { Layout, Button, Input, Table, Checkbox, Upload, message } from "antd";
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
import "../style/content-main.scss";
import BreadcrumbNav from "../../components/BreadcrumbNav";
import CreateFolderModal from "../../components/CreateFolderModal";
import {
  FileType,
  FileTypeMap,
  getFileTypeByExt,
} from "../../enums/FileTypeEnum";
import { createFile, getFileList } from "@/api/file";
import { FileInfo } from "@/types/file";

const { Content } = Layout;

function ContentMain() {
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

  // 加载文件列表
  const loadFileList = async () => {
    try {
      setLoading(true);
      const res = await getFileList({
        catalogue: currentPath,
      });
      if (res.code === 0) {
        setFileList(res.data);
      } else {
        message.error(res.msg || "获取文件列表失败");
      }
    } catch (error) {
      message.error("获取文件列表失败");
      console.error("Load file list error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载和路径变化时加载文件列表
  useEffect(() => {
    loadFileList();
  }, [currentPath]);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    try {
      const fileType = getFileTypeByExt(file.name);
      const res = await createFile({
        name: file.name,
        type: fileType,
        catalogue: currentPath,
        size: (file.size / (1024 * 1024)).toFixed(2), // 转换为MB
        file: file,
      });

      if (res.code === 0) {
        message.success("文件上传成功");
        loadFileList(); // 刷新文件列表
      } else {
        message.error(res.msg || "文件上传失败");
      }
    } catch (error) {
      message.error("文件上传失败");
      console.error("Upload error:", error);
    }
  };

  // 处理新建文件夹
  const handleCreateFolder = async (values: { name: string }) => {
    try {
      const res = await createFile({
        name: values.name,
        type: FileType.DIRECTORY,
        catalogue: currentPath,
      });

      if (res.code === 0) {
        message.success("文件夹创建成功");
        setCreateFolderVisible(false);
        loadFileList(); // 刷新文件列表
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
      // TODO: 处理文件点击，比如预览文件
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
      render: (size: string | null) => (size ? `${size} MB` : "-"),
    },
    {
      title: "修改日期",
      dataIndex: "createTime",
      key: "createTime",
      render: (time: number) => new Date(time).toLocaleString(),
    },
  ];

  return (
    <Content className="content-main">
      <div className="operation-bar">
        <div className="left-buttons">
          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              handleFileUpload(file);
              return false;
            }}
          >
            <Button type="primary" icon={<UploadOutlined />}>
              上传
            </Button>
          </Upload>
          <Button
            icon={<FolderAddOutlined />}
            onClick={() => setCreateFolderVisible(true)}
          >
            新建文件夹
          </Button>
          <Button icon={<CloudDownloadOutlined />}>离线下载</Button>
          <Button icon={<SettingOutlined />}>我的设备</Button>
        </div>
        <div className="right-search">
          <Input
            placeholder="搜索您的文件"
            prefix={<SearchOutlined />}
            className="search-input"
          />
          <div className="view-switch">
            <BarsOutlined className="active" />
            <AppstoreOutlined />
          </div>
        </div>
      </div>
      <BreadcrumbNav onPathChange={handlePathChange} />
      <div className="table-header">
        <div className="left">全部文件</div>
        <div className="right">已加载全部，共{fileList.length}个</div>
      </div>
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={fileList}
          pagination={false}
          showHeader={true}
          loading={loading}
          rowKey="id"
        />
      </div>
      <CreateFolderModal
        visible={createFolderVisible}
        onCancel={() => setCreateFolderVisible(false)}
        onSubmit={handleCreateFolder}
      />
    </Content>
  );
}

export default ContentMain;
