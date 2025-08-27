/**
 * 文件网格视图组件
 */
import React from "react";

import { Checkbox, Button, Input } from "antd";
import {
  CloudDownloadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { FileInfo } from "@/types/file";
import { getFileIcon, formatDateTime } from "@/utils/fileUtils";
import { FILE_TYPE_CHECKS } from "@/constants/fileConstants";

interface FileGridProps {
  fileList: FileInfo[];
  selectedRowKeys: string[];
  actionLoading: boolean;
  fileType?: number;
  editingFileId: string | null;
  editingFileName: string;
  isRenaming: boolean;
  onSelect: (checked: boolean, key: string) => void;
  onFileClick: (record: FileInfo) => void;
  onSingleDownload: (record: FileInfo) => void;
  onSingleShare: (record: FileInfo) => void;
  onSingleDelete: (record: FileInfo) => void;
  onSingleRestore?: (record: FileInfo) => void;
  onContextMenu: (e: React.MouseEvent, record: FileInfo) => void;
  onEditingFileNameChange: (value: string) => void;
  onRenameSubmit: (record: FileInfo, e?: React.MouseEvent) => void;
}

const FileGrid: React.FC<FileGridProps> = ({
  fileList,
  selectedRowKeys,
  actionLoading,
  fileType,
  editingFileId,
  editingFileName,
  isRenaming,
  onSelect,
  onFileClick,
  onSingleDownload,
  onSingleShare,
  onSingleDelete,
  onSingleRestore,
  onContextMenu,
  onEditingFileNameChange,
  onRenameSubmit,
}) => {
  const isRecycleBin = FILE_TYPE_CHECKS.isRecycleBin(fileType);
  const isSharedFiles = FILE_TYPE_CHECKS.isSharedFiles(fileType);

  const renderFileActions = (file: FileInfo) => {
    if (isRecycleBin) {
      return (
        <div className="grid-item-actions">
          <Button
            type="link"
            icon={<UndoOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              if (!actionLoading && onSingleRestore) {
                onSingleRestore(file);
              }
            }}
            disabled={actionLoading}
            loading={actionLoading}
            title="恢复"
          />
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              if (!actionLoading) {
                onSingleDelete(file);
              }
            }}
            disabled={actionLoading}
            loading={actionLoading}
            title="永久删除"
          />
        </div>
      );
    }

    if (isSharedFiles) {
      return (
        <div className="grid-item-actions">
          <Button
            type="link"
            icon={<UndoOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              if (!actionLoading) {
                onSingleDelete(file);
              }
            }}
            disabled={actionLoading}
            loading={actionLoading}
            title="取消分享"
          />
        </div>
      );
    }

    return (
      <div className="grid-item-actions">
        <Button
          type="link"
          icon={<CloudDownloadOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            if (!actionLoading) {
              onSingleDownload(file);
            }
          }}
          disabled={actionLoading}
          title="下载"
        />
        <Button
          type="link"
          icon={<ShareAltOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            if (!actionLoading) {
              onSingleShare(file);
            }
          }}
          disabled={actionLoading}
          loading={actionLoading}
          title="分享"
        />
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            if (!actionLoading) {
              onSingleDelete(file);
            }
          }}
          disabled={actionLoading}
          loading={actionLoading}
          title="删除"
        />
      </div>
    );
  };

  return (
    <div className="grid-view">
      {fileList.map((file) => (
        <div
          key={file.id}
          className={`grid-item ${
            selectedRowKeys.includes(file.id.toString()) ? "selected" : ""
          } ${editingFileId === file.id.toString() ? "editing" : ""}`}
          onClick={() => !actionLoading && onFileClick(file)}
          onContextMenu={(e) =>
            !actionLoading && onContextMenu(e, file)
          }
        >
          <div className="grid-item-checkbox">
            <Checkbox
              checked={selectedRowKeys.includes(file.id.toString())}
              onClick={(e) => {
                e.stopPropagation();
                if (!actionLoading) {
                  onSelect(
                    !selectedRowKeys.includes(file.id.toString()),
                    file.id.toString()
                  );
                }
              }}
              disabled={actionLoading}
            />
          </div>
          <div className="grid-item-icon">{getFileIcon(file.type)}</div>
          {editingFileId === file.id.toString() ? (
            <Input
              value={editingFileName}
              onChange={(e) => onEditingFileNameChange(e.target.value)}
              onPressEnter={() => onRenameSubmit(file)}
              onBlur={() => onRenameSubmit(file)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              disabled={isRenaming}
            />
          ) : (
            <div className="grid-item-name" title={file.name}>
              {file.name}
            </div>
          )}
          <div className="grid-item-info">
            <span>{file.size ? `${file.size} MB` : "-"}</span>
            <span>{formatDateTime(Number(file.createTime))}</span>
          </div>
          {renderFileActions(file)}
        </div>
      ))}
    </div>
  );
};

export default FileGrid;
