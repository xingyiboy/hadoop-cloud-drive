import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table, message, Button, Layout } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import request from "@/utils/request";
import { FileType, FileTypeMap } from "@/enums/FileTypeEnum";
import type { FileInfo } from "@/types/file";
import "./ShareView.scss";

const { Content } = Layout;

const ShareView: React.FC = () => {
  const { shareKey } = useParams<{ shareKey: string }>();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      const res = await request.get(
        `/admin-api/system/hadoop-file/share-link/${shareKey}`
      );
      if (res.code === 0 && res.data) {
        setFileList(res.data);
      } else {
        setError(res.msg || "获取分享文件失败");
        message.error(res.msg || "获取分享文件失败");
      }
    } catch (error) {
      const errorMessage = "获取分享文件失败，请检查分享链接是否正确";
      setError(errorMessage);
      message.error(errorMessage);
      console.error("Load share files error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 下载文件
  const handleDownload = async (fileName: string) => {
    try {
      const response = await request.get(
        `/admin-api/system/hadoop-file/download-shared/${shareKey}/${fileName}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
    if (shareKey) {
      loadShareFiles();
    }
  }, [shareKey]);

  if (error) {
    return (
      <Layout className="share-view">
        <Content className="share-content error-content">
          <div className="error-message">
            <h2>😢 {error}</h2>
            <p>提示：请确认分享链接是否完整，或者该分享可能已经被取消。</p>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="share-view">
      <Content className="share-content">
        <div className="share-header">
          <h2>分享文件</h2>
          <p>分享密钥：{shareKey}</p>
        </div>
        <div className="share-table">
          <Table
            columns={columns}
            dataSource={fileList}
            pagination={false}
            loading={loading}
            rowKey="id"
          />
        </div>
      </Content>
    </Layout>
  );
};

export default ShareView;
