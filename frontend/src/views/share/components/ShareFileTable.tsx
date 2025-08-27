import React from "react";
import { Table, Button } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { FileType, FileTypeMap } from "@/enums/FileTypeEnum";
import FileIcon from "@/components/FileIcon";
import type { FileInfo } from "@/types/file";

interface ShareFileTableProps {
  fileList: FileInfo[];
  loading: boolean;
  onDownload: (fileName: string) => void;
}

const ShareFileTable: React.FC<ShareFileTableProps> = ({
  fileList,
  loading,
  onDownload,
}) => {
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
              <FileIcon type={record.type} />
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
            onDownload(record.name.split("/").pop() || record.name)
          }
        >
          下载
        </Button>
      ),
    },
  ];

  return (
    <div className="share-table">
      <Table
        columns={columns}
        dataSource={fileList}
        pagination={false}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default ShareFileTable;
