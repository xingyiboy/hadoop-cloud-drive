/**
 * 文件操作栏组件
 */
import React from "react";

import { Button, Input, Upload } from "antd";
import {
  UploadOutlined,
  FolderAddOutlined,
  CloudDownloadOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  UndoOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { RcFile } from "antd/lib/upload";
import { FileType, FileTypeMap } from "@/enums/FileTypeEnum";
import { FILE_TYPE_CHECKS, VIEW_TYPES } from "@/constants/fileConstants";

interface OperationBarProps {
  fileType?: FileType;
  selectedRowKeys: string[];
  searchKeyword: string;
  viewType: "list" | "grid";
  actionLoading: boolean;
  onFileUpload: (fileList: File[] | RcFile[]) => void;
  onCreateFolder: () => void;
  onBatchDownload: () => void;
  onBatchShare: () => void;
  onBatchDelete: () => void;
  onBatchRestore?: () => void;
  onBatchCancelShare?: () => void;
  onBatchPermanentDelete?: () => void;
  onSearchChange: (keyword: string) => void;
  onSearch: () => void;
  onViewTypeChange: (type: "list" | "grid") => void;
}

const OperationBar: React.FC<OperationBarProps> = ({
  fileType,
  selectedRowKeys,
  searchKeyword,
  viewType,
  actionLoading,
  onFileUpload,
  onCreateFolder,
  onBatchDownload,
  onBatchShare,
  onBatchDelete,
  onBatchRestore,
  onBatchCancelShare,
  onBatchPermanentDelete,
  onSearchChange,
  onSearch,
  onViewTypeChange,
}) => {
  const isRecycleBin = FILE_TYPE_CHECKS.isRecycleBin(fileType);
  const isSharedFiles = FILE_TYPE_CHECKS.isSharedFiles(fileType);
  const hasSelection = selectedRowKeys.length > 0;

  // 清空搜索
  const handleClearSearch = () => {
    if (!actionLoading) {
      onSearchChange('');
    }
  };

  const renderLeftButtons = () => {
    if (isRecycleBin) {
      return (
        hasSelection && (
          <>
            <Button
              type="primary"
              icon={<UndoOutlined />}
              onClick={onBatchRestore}
              disabled={actionLoading}
              loading={actionLoading}
            >
              恢复 {hasSelection && `(${selectedRowKeys.length})`}
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={onBatchPermanentDelete}
              disabled={actionLoading}
              loading={actionLoading}
            >
              永久删除 {hasSelection && `(${selectedRowKeys.length})`}
            </Button>
          </>
        )
      );
    }

    if (isSharedFiles) {
      return (
        hasSelection && (
          <Button
            type="primary"
            icon={<UndoOutlined />}
            onClick={onBatchCancelShare}
            disabled={actionLoading}
            loading={actionLoading}
          >
            取消分享 {hasSelection && `(${selectedRowKeys.length})`}
          </Button>
        )
      );
    }

    return (
      <>
        <Upload
          multiple
          showUploadList={false}
          beforeUpload={(file, fileList) => {
            if (file === fileList[0] && !actionLoading) {
              onFileUpload(fileList);
            }
            return false;
          }}
          disabled={
            fileType !== undefined || hasSelection || actionLoading
          }
        >
          <Button
            type="primary"
            disabled={
              fileType !== undefined || hasSelection || actionLoading
            }
            icon={<UploadOutlined />}
          >
            上传
          </Button>
        </Upload>
        <Button
          icon={<FolderAddOutlined />}
          onClick={() => !actionLoading && onCreateFolder()}
          disabled={
            fileType !== undefined || hasSelection || actionLoading
          }
        >
          新建文件夹
        </Button>
        {hasSelection && (
          <>
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={onBatchDownload}
              disabled={actionLoading}
              loading={actionLoading}
            >
              下载 {hasSelection && `(${selectedRowKeys.length})`}
            </Button>
            <Button
              icon={<ShareAltOutlined />}
              onClick={onBatchShare}
              disabled={actionLoading}
              loading={actionLoading}
            >
              分享 {hasSelection && `(${selectedRowKeys.length})`}
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={onBatchDelete}
              disabled={actionLoading}
              loading={actionLoading}
            >
              删除 {hasSelection && `(${selectedRowKeys.length})`}
            </Button>
          </>
        )}
      </>
    );
  };

  return (
    <div className="operation-bar">
      <div className="left-buttons">
        {renderLeftButtons()}
        {viewType === "grid" && hasSelection && (
          <span className="selected-count">
            已选择 {selectedRowKeys.length} 个文件
          </span>
        )}
      </div>
      <div className="right-search">
        <Input
          placeholder="搜索您的文件"
          prefix={<SearchOutlined />}
          suffix={
            searchKeyword ? (
              <CloseOutlined
                style={{ cursor: 'pointer', color: '#666' }}
                onClick={handleClearSearch}
                title="清空搜索"
              />
            ) : null
          }
          className="search-input"
          value={searchKeyword}
          onChange={(e) => !actionLoading && onSearchChange(e.target.value)}
          onPressEnter={onSearch}
          disabled={actionLoading}
        />
        <div className="view-switch">
          <BarsOutlined
            className={viewType === VIEW_TYPES.LIST ? "active" : ""}
            onClick={() => !actionLoading && onViewTypeChange(VIEW_TYPES.LIST)}
          />
          <AppstoreOutlined
            className={viewType === VIEW_TYPES.GRID ? "active" : ""}
            onClick={() => !actionLoading && onViewTypeChange(VIEW_TYPES.GRID)}
          />
        </div>
      </div>
    </div>
  );
};

export default OperationBar;
