import React, { useState, useEffect } from "react";
import { Modal, Table, message, Button, Checkbox, Tree } from "antd";
import {
  CloudDownloadOutlined,
  FolderOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import request from "@/utils/request";
import { FileType, FileTypeMap } from "@/enums/FileTypeEnum";
import type { FileInfo } from "@/types/file";

import { getFileList } from "@/api/file";

interface ShareDownloadModalProps {
  shareKey: string;
  visible: boolean;
  onCancel: () => void;
}

const ShareDownloadModal: React.FC<ShareDownloadModalProps> = ({
  shareKey,
  visible,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [folderTree, setFolderTree] = useState<any[]>([]);
  const [targetPath, setTargetPath] = useState<string>("/");
  const [saveLoading, setSaveLoading] = useState(false);

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

  // 加载分享文件列表
  const loadShareFiles = async () => {
    try {
      setLoading(true);
      const res = await request.get(
        `/admin-api/system/hadoop-file/share-link/${shareKey}`
      );
      if (res.code === 0 && res.data) {
        setFileList(res.data);
      } else {
        message.error(res.msg || "获取分享文件失败");
        onCancel();
      }
    } catch (error) {
      message.error("获取分享文件失败，请检查分享链接是否正确");
      console.error("Load share files error:", error);
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  // 下载单个文件
  const handleDownload = async (fileName: string) => {
    try {
      setDownloadLoading(true);
      const response = await request.get(
        `/admin-api/system/hadoop-file/download-shared/${shareKey}/${encodeURIComponent(
          fileName
        )}`,
        {
          responseType: "blob",
          headers: {
            Accept: "application/octet-stream",
          },
        }
      );

      // 从响应头中获取文件名
      let downloadFileName = fileName;
      const contentDisposition = response.headers?.["content-disposition"];
      if (contentDisposition) {
        const matches = /filename\*=UTF-8''(.+)/.exec(contentDisposition);
        if (matches && matches[1]) {
          downloadFileName = decodeURIComponent(matches[1]);
        }
      }

      // 创建 Blob URL 并触发下载
      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();

      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      message.success("下载成功");
    } catch (error) {
      message.error("下载失败");
      console.error("Download error:", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  // 批量下载文件
  const handleBatchDownload = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要下载的文件");
      return;
    }

    try {
      setDownloadLoading(true);
      const selectedFiles = fileList.filter((file) =>
        selectedRowKeys.includes(file.id.toString())
      );

      for (const file of selectedFiles) {
        const fileName = file.name.split("/").pop() || file.name;
        await handleDownload(fileName);
        // 添加延迟以避免浏览器限制
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      message.success(`已完成 ${selectedFiles.length} 个文件的下载`);
      setSelectedRowKeys([]);
    } catch (error) {
      message.error("批量下载失败");
      console.error("Batch download error:", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = fileList.map((file) => file.id.toString());
      setSelectedRowKeys(allIds);
    } else {
      setSelectedRowKeys([]);
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
            disabled={downloadLoading}
          />
          <span className="column-title">文件名</span>
          {selectedRowKeys.length > 0 && (
            <span className="selected-count">
              已选择 {selectedRowKeys.length} 个文件
            </span>
          )}
        </div>
      ),
      dataIndex: "name",
      key: "name",
      render: (text: string, record: FileInfo) => {
        const fileName = text.split("/").pop() || text;
        return (
          <div className="file-name-cell">
            <Checkbox
              checked={selectedRowKeys.includes(record.id.toString())}
              onChange={(e) => {
                const key = record.id.toString();
                if (e.target.checked) {
                  setSelectedRowKeys([...selectedRowKeys, key]);
                } else {
                  setSelectedRowKeys(selectedRowKeys.filter((k) => k !== key));
                }
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={downloadLoading}
            />
            <div className="file-name-content">
              {getFileIcon(record.type)}
              <span className="file-name-text">{fileName}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: <span className="column-title">类型</span>,
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: FileType) => FileTypeMap[type],
    },
    {
      title: <span className="column-title">大小</span>,
      dataIndex: "size",
      key: "size",
      width: 120,
      render: (size: string | null) => (size ? `${size} MB` : "-"),
    },
    {
      title: <span className="column-title">操作</span>,
      key: "action",
      width: 100,
      render: (_: any, record: FileInfo) => (
        <Button
          type="link"
          className="download-btn"
          icon={<CloudDownloadOutlined />}
          onClick={() =>
            handleDownload(record.name.split("/").pop() || record.name)
          }
          disabled={downloadLoading}
        >
          下载
        </Button>
      ),
    },
  ];

  // 添加获取所有文件夹的函数
  const getAllFolders = async (
    parentPath: string = "/"
  ): Promise<FileInfo[]> => {
    const folders: FileInfo[] = [];
    try {
      const res = await getFileList({
        type: FileType.DIRECTORY,
        pageSize: 100,
        pageNo: 1,
        catalogue: parentPath,
      });

      if (res.code === 0 && res.data) {
        const currentFolders = (res.data as any).list || [];
        folders.push(...currentFolders);

        // 递归获取每个文件夹的子文件夹
        for (const folder of currentFolders) {
          const subPath =
            parentPath === "/"
              ? `/${folder.name}`
              : `${parentPath}/${folder.name}`;
          const subFolders = await getAllFolders(subPath);
          folders.push(...subFolders);
        }
      }
    } catch (error) {
      console.error("获取文件夹失败:", error);
    }
    return folders;
  };

  // 添加构建文件夹树的函数
  const buildFolderTree = (folders: FileInfo[]) => {
    const root = {
      title: "根目录",
      key: "/",
      children: [] as any[],
    };

    folders.sort((a, b) => {
      const pathA = (a.catalogue === "/" ? "" : a.catalogue) + "/" + a.name;
      const pathB = (b.catalogue === "/" ? "" : b.catalogue) + "/" + b.name;
      return pathA.split("/").length - pathB.split("/").length;
    });

    folders.forEach((folder) => {
      const path = folder.catalogue === "/" ? "" : folder.catalogue;
      const fullPath = path + "/" + folder.name;
      const node = {
        title: folder.name,
        key: fullPath,
        children: [] as any[],
      };

      let parentPath = path || "/";
      let parent = root;

      if (parentPath !== "/") {
        const pathParts = parentPath.split("/").filter(Boolean);
        for (const part of pathParts) {
          const found = findNode(root, part);
          if (found) {
            parent = found;
          }
        }
      }
      parent.children.push(node);
    });

    return [root];
  };

  // 添加查找节点的辅助函数
  const findNode = (node: any, name: string): any => {
    if (node.title === name) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, name);
        if (found) return found;
      }
    }
    return null;
  };

  // 添加获取文件夹树的函数
  const getFolderTree = async () => {
    try {
      const folders = await getAllFolders();
      const tree = buildFolderTree(folders);
      setFolderTree(tree);
    } catch (error) {
      console.error("获取文件夹树失败:", error);
      message.error("获取文件夹树失败");
    }
  };

  // 添加保存文件的函数
  const handleSaveFiles = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要保存的文件");
      return;
    }

    try {
      setSaveLoading(true);
      const selectedFiles = fileList.filter((file) =>
        selectedRowKeys.includes(file.id.toString())
      );

      // 调用保存文件的 API
      const res = await request.post(
        "/admin-api/system/hadoop-file/save-shared",
        {
          shareKey,
          fileIds: selectedRowKeys,
          targetPath,
        }
      );

      if (res.code === 0) {
        message.success(`成功保存 ${selectedFiles.length} 个文件`);
        setSaveModalVisible(false);
        setSelectedRowKeys([]);
      } else {
        message.error(res.msg || "保存失败");
      }
    } catch (error) {
      console.error("Save files error:", error);
      message.error("保存文件失败");
    } finally {
      setSaveLoading(false);
    }
  };

  // 添加打开保存模态框的函数
  const handleOpenSaveModal = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要保存的文件");
      return;
    }
    await getFolderTree();
    setSaveModalVisible(true);
  };

  // 修改 Modal 的 footer
  const modalFooter = [
    <Button key="cancel" onClick={onCancel}>
      取消
    </Button>,
    <Button
      key="save"
      type="primary"
      icon={<SaveOutlined />}
      onClick={handleOpenSaveModal}
      disabled={selectedRowKeys.length === 0 || downloadLoading}
    >
      保存到我的文件夹
    </Button>,
    <Button
      key="download"
      type="primary"
      icon={<CloudDownloadOutlined />}
      onClick={handleBatchDownload}
      disabled={selectedRowKeys.length === 0 || downloadLoading}
      loading={downloadLoading}
    >
      下载选中文件
    </Button>,
  ];

  useEffect(() => {
    if (visible && shareKey) {
      loadShareFiles();
      setSelectedRowKeys([]); // 重置选择状态
    }
  }, [visible, shareKey]);

  return (
    <>
      <Modal
        title={`分享文件 - ${shareKey}`}
        open={visible}
        onCancel={onCancel}
        footer={modalFooter}
        width={800}
        destroyOnClose
        className="share-download-modal"
      >
        <Table
          columns={columns}
          dataSource={fileList}
          pagination={false}
          loading={loading}
          rowKey="id"
          size="small"
        />
      </Modal>

      <Modal
        title="选择保存位置"
        open={saveModalVisible}
        onCancel={() => setSaveModalVisible(false)}
        onOk={handleSaveFiles}
        confirmLoading={saveLoading}
        width={400}
      >
        <Tree
          treeData={folderTree}
          defaultExpandAll
          icon={<FolderOutlined />}
          selectedKeys={[targetPath]}
          onSelect={(selectedKeys) => {
            if (selectedKeys.length > 0) {
              setTargetPath(selectedKeys[0].toString());
            }
          }}
        />
      </Modal>
    </>
  );
};

export default ShareDownloadModal;
