/**
 * 文件表格组件
 */
import React from "react";

import { Table, Checkbox, Button, Input } from "antd";
import {
  CloudDownloadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import type { SorterResult } from "antd/lib/table/interface";
import { FileInfo } from "@/types/file";
import { FileType, FileTypeMap } from "@/enums/FileTypeEnum";
import { getFileIcon, formatDateTime } from "@/utils/fileUtils";
import { FILE_TYPE_CHECKS } from "@/constants/fileConstants";

interface FileTableProps {
  fileList: FileInfo[];
  selectedRowKeys: string[];
  loading: boolean;
  actionLoading: boolean;
  fileType?: number;
  editingFileId: string | null;
  editingFileName: string;
  isRenaming: boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelect: (checked: boolean, key: string) => void;
  onFileClick: (record: FileInfo) => void;
  onSingleDownload: (record: FileInfo) => void;
  onSingleShare: (record: FileInfo) => void;
  onSingleDelete: (record: FileInfo) => void;
  onSingleRestore?: (record: FileInfo) => void;
  onContextMenu: (e: React.MouseEvent, record: FileInfo) => void;
  onTableChange: (
    pagination: any,
    filters: any,
    sorter: SorterResult<FileInfo> | SorterResult<FileInfo>[]
  ) => void;
  onEditingFileNameChange: (value: string) => void;
  onRenameSubmit: (record: FileInfo, e?: React.MouseEvent) => void;
  onRenameCancel: (e?: React.MouseEvent) => void;
}

const FileTable: React.FC<FileTableProps> = ({
  fileList,
  selectedRowKeys,
  loading,
  actionLoading,
  fileType,
  editingFileId,
  editingFileName,
  isRenaming,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelect,
  onFileClick,
  onSingleDownload,
  onSingleShare,
  onSingleDelete,
  onSingleRestore,
  onContextMenu,
  onTableChange,
  onEditingFileNameChange,
  onRenameSubmit,
  onRenameCancel,
}) => {
  const isRecycleBin = FILE_TYPE_CHECKS.isRecycleBin(fileType);
  const isSharedFiles = FILE_TYPE_CHECKS.isSharedFiles(fileType);

  const renderFileActions = (record: FileInfo) => {
    if (isRecycleBin) {
      return (
        <div className="file-actions">
          <Button
            type="link"
            icon={<UndoOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              if (!actionLoading && onSingleRestore) {
                onSingleRestore(record);
              }
            }}
            disabled={actionLoading}
            loading={actionLoading}
            className={actionLoading ? "disabled" : ""}
          >
            恢复
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              if (!actionLoading && onSingleDelete) {
                onSingleDelete(record);
              }
            }}
            disabled={actionLoading}
            loading={actionLoading}
            className={actionLoading ? "disabled" : ""}
          >
            永久删除
          </Button>
        </div>
      );
    }

    if (isSharedFiles) {
      return (
        <div className="file-actions">
          <Button
            type="link"
            icon={<UndoOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              if (!actionLoading) {
                onSingleDelete(record);
              }
            }}
            disabled={actionLoading}
            loading={actionLoading}
            className={actionLoading ? "disabled" : ""}
          >
            取消分享
          </Button>
        </div>
      );
    }

    return (
      <div className="file-actions">
        <Button
          type="link"
          icon={<CloudDownloadOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            if (!actionLoading) {
              onSingleDownload(record);
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
              onSingleShare(record);
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
              onSingleDelete(record);
            }
          }}
          disabled={actionLoading}
          loading={actionLoading}
          className={actionLoading ? "disabled" : ""}
        >
          删除
        </Button>
      </div>
    );
  };

  const columns = [
    {
      title: (
        <div className="file-name-header" onClick={(e) => e.stopPropagation()}>
          {!isSharedFiles && (
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => {
                e.stopPropagation();
                if (!actionLoading) {
                  onSelectAll(e.target.checked);
                }
              }}
              disabled={actionLoading}
            />
          )}
          <span>文件名</span>
          {selectedRowKeys.length > 0 && (
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
      render: (text: string, record: FileInfo) => (
        <div className="file-name-cell">
          <Checkbox
            checked={selectedRowKeys.includes(record.id.toString())}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              !actionLoading &&
              onSelect(e.target.checked, record.id.toString())
            }
            disabled={actionLoading}
          />
          <div
            className={`file-name-content ${
              actionLoading ? "disabled" : ""
            } ${editingFileId === record.id.toString() ? "editing" : ""}`}
            onClick={() => !actionLoading && onFileClick(record)}
            onContextMenu={(e) =>
              !actionLoading && onContextMenu(e, record)
            }
          >
            {getFileIcon(record.type)}
            {editingFileId === record.id.toString() ? (
              <Input
                value={editingFileName}
                onChange={(e) => onEditingFileNameChange(e.target.value)}
                onPressEnter={() => onRenameSubmit(record)}
                onBlur={() => onRenameSubmit(record)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                disabled={isRenaming}
              />
            ) : (
              <span className="file-name-text">{text}</span>
            )}
            {editingFileId !== record.id.toString() && renderFileActions(record)}
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
    <Table
      columns={columns}
      dataSource={fileList}
      pagination={false}
      showHeader={true}
      loading={loading}
      rowKey="id"
      onChange={onTableChange}
    />
  );
};

export default FileTable;
