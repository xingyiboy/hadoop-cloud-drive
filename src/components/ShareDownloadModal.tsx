import React, { useState, useEffect } from "react";
import { Modal, Table, message, Button } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import request from "@/utils/request";
import { FileType, FileTypeMap } from "@/enums/FileTypeEnum";
import type { FileInfo } from "@/types/file";

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

  // 下载文件
  const handleDownload = async (fileName: string) => {
    try {
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
    }
  };

  // 表格列定义
  const columns = [
    {
      title: "文件名",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: FileInfo) => {
        const fileName = text.split("/").pop() || text;
        return (
          <div className="file-name-cell">
            <div className="file-name-content">
              {getFileIcon(record.type)}
              <span className="file-name-text">{fileName}</span>
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
      render: (size: string | null) => (size ? `${size} MB` : "-"),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: FileInfo) => (
        <Button
          type="link"
          icon={<CloudDownloadOutlined />}
          onClick={() =>
            handleDownload(record.name.split("/").pop() || record.name)
          }
        >
          下载
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (visible && shareKey) {
      loadShareFiles();
    }
  }, [visible, shareKey]);

  return (
    <Modal
      title={`分享文件 - ${shareKey}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
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
  );
};

export default ShareDownloadModal;
