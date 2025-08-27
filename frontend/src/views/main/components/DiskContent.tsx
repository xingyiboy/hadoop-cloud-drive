import { Layout, Pagination, Spin, Menu, Modal, Tree, message, Button } from "antd";
import { LoadingOutlined, FolderOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

import BreadcrumbNav from "./BreadcrumbNav";
import CreateFolderModal from "./CreateFolderModal";
import OperationBar from "./file/OperationBar";
import FileTable from "./file/FileTable";
import FileGrid from "./file/FileGrid";
import { FileType, FileTypeMap } from "@/enums/FileTypeEnum";
import { FileInfo } from "@/types/file";
import { useLocation } from "react-router-dom";
import request from "@/utils/request";
import { getFileList, moveFile } from "@/api/file";
import { copyToClipboard } from "@/utils/fileUtils";
import { FILE_TYPE_CHECKS, VIEW_TYPES } from "@/constants/fileConstants";

// Hooks
import { useFileList } from "@/hooks/useFileList";
import { useFileSelection } from "@/hooks/useFileSelection";
import { useFileOperations } from "@/hooks/useFileOperations";
import { useFileEdit } from "@/hooks/useFileEdit";

const { Content } = Layout;

interface DiskContentProps {
  fileType: FileType | undefined;
  activeTab?: number;
  onTabChange?: (tab: number) => void;
}

interface GroupedSharedFile {
  shareKey: string;
  files: FileInfo[];
}

const DiskContent: React.FC<DiskContentProps> = ({ fileType, onTabChange }) => {
  // 基础状态
  const [currentPath, setCurrentPath] = useState<string>(
    localStorage.getItem("currentPath") || "/"
  );
  const [createFolderVisible, setCreateFolderVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [viewType, setViewType] = useState<"list" | "grid">("list");
  const [groupedSharedFiles, setGroupedSharedFiles] = useState<GroupedSharedFile[]>([]);
  
  // 移动文件相关状态
  const [moveModalVisible, setMoveModalVisible] = useState<boolean>(false);
  const [moveTargetPath, setMoveTargetPath] = useState<string>("/");
  const [moveFileInfo, setMoveFileInfo] = useState<FileInfo | null>(null);
  const [folderTree, setFolderTree] = useState<any[]>([]);

  // 使用自定义hooks
  const {
    fileList,
    loading,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    handleTableChange,
    refreshFileList,
  } = useFileList({ currentPath, fileType, searchKeyword });

  const {
    selectedRowKeys,
    setSelectedRowKeys,
    handleSelectAll,
    handleSelect,
    clearSelection,
    isAllSelected,
    isIndeterminate,
  } = useFileSelection({ fileList, fileType, currentPath });

  const {
    actionLoading,
    handleFileUpload,
    handleSingleDownload,
    handleSingleShare,
    handleSingleDelete,
    handleBatchDownload,
    handleBatchShare,
    handleBatchCancelShare,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchPermanentDelete,
    handleRename,
    handleMove: handleMoveFile,
    handleCreateFolder,
  } = useFileOperations({
    currentPath,
    fileType,
    onRefresh: refreshFileList,
    onTabChange,
    fileList,
  });

  const {
    editingFileId,
    editingFileName,
    isRenaming,
    contextMenuPosition,
    rightClickedFile,
    startRename,
    cancelRename,
    handleContextMenu,
    updateEditingFileName,
    setRenamingStatus,
    clearContextMenu,
  } = useFileEdit();

  const location = useLocation();
  const baseUrl = window.location.origin;

  // 自定义加载图标
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  // 搜索处理函数
  const handleSearch = () => {
    if (!actionLoading) {
      refreshFileList();
    }
  };

  // 搜索关键词变化处理
  const handleSearchChange = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  // 处理新建文件夹
  const handleCreateFolderSubmit = async (values: { name: string }) => {
    const success = await handleCreateFolder(values.name);
    if (success) {
        setCreateFolderVisible(false);
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

  // 复制分享链接
  const copyShareLink = async (shareKey: string) => {
    const shareUrl = `${baseUrl}/share/${shareKey}`;
    const success = await copyToClipboard(shareUrl);
    if (success) {
            message.success("分享链接已复制到剪贴板");
      } else {
      message.error("复制失败，请手动复制");
    }
  };

  // 重命名提交处理
  const handleRenameSubmit = async (record: FileInfo, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const trimmedName = editingFileName.trim();

    if (!trimmedName) {
      message.error("文件名不能为空");
      return;
    }

    if (trimmedName === record.name) {
      cancelRename();
      return;
    }

    setRenamingStatus(true);
    const success = await handleRename(record.id.toString(), trimmedName);
    setRenamingStatus(false);
    if (success) {
      cancelRename();
    }
  };

  // 解析分享密钥
  const extractShareKey = (name: string): string | null => {
    if (!name) return null;
    const parts = name.split("/").filter(Boolean);
    const idx = parts.indexOf("分享（hadoop）");
    if (idx !== -1 && parts.length > idx + 1) {
      return parts[idx + 1];
    }
    // 回退：如果固定格式为 开头即 分享（hadoop）/key/...
    if (parts.length >= 2 && parts[0] === "分享（hadoop）") {
      return parts[1];
    }
    return null;
  };

  // 根据密钥分组分享文件
  useEffect(() => {
    if (!FILE_TYPE_CHECKS.isSharedFiles(fileType)) {
      setGroupedSharedFiles([]);
      return;
    }
    const groupsMap: Record<string, FileInfo[]> = {};
    fileList.forEach((file) => {
      const key = extractShareKey(file.name);
      if (!key) return;
      if (!groupsMap[key]) groupsMap[key] = [];
      groupsMap[key].push(file);
    });

    const groups: GroupedSharedFile[] = Object.keys(groupsMap).map((k) => ({
      shareKey: k,
      files: groupsMap[k],
    }));
    setGroupedSharedFiles(groups);
  }, [fileList, fileType]);

  // 取消整个分享（按密钥）
  const handleCancelShareGroup = async (shareKey: string) => {
    const ids = fileList
      .filter((f) => extractShareKey(f.name) === shareKey)
      .map((f) => f.id.toString());
    if (ids.length === 0) return;
    await handleBatchCancelShare(ids, () => {
      // 清除这些文件的选择状态
      setSelectedRowKeys((prev) => prev.filter((id) => !ids.includes(id)));
    });
  };

  // 获取文件夹树
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

  // 获取所有文件夹
  const getAllFolders = async (parentPath: string = "/"): Promise<FileInfo[]> => {
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
          const subPath = parentPath === "/" ? `/${folder.name}` : `${parentPath}/${folder.name}`;
          const subFolders = await getAllFolders(subPath);
          folders.push(...subFolders);
        }
      }
    } catch (error) {
      console.error("获取文件夹失败:", error);
    }
    return folders;
  };

  // 构建文件夹树
  const buildFolderTree = (folders: FileInfo[]) => {
    const root = { title: "根目录", key: "/", children: [] as any[] };
    
    folders.sort((a, b) => {
      const pathA = (a.catalogue === "/" ? "" : a.catalogue) + "/" + a.name;
      const pathB = (b.catalogue === "/" ? "" : b.catalogue) + "/" + b.name;
      return pathA.split("/").length - pathB.split("/").length;
    });

    folders.forEach((folder) => {
      const path = folder.catalogue === "/" ? "" : folder.catalogue;
      const fullPath = path + "/" + folder.name;
      const node = { title: folder.name, key: fullPath, children: [] as any[] };

      let parentPath = path || "/";
      let parent = root;

      if (parentPath !== "/") {
        const pathParts = parentPath.split("/").filter(Boolean);
        for (const part of pathParts) {
          const found = findNode(root, part);
          if (found) parent = found;
        }
      }
      parent.children.push(node);
    });

    return [root];
  };

  // 查找节点
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

  // 处理移动文件
  const handleMove = async (record: FileInfo) => {
    setMoveFileInfo(record);
    await getFolderTree();
    setMoveModalVisible(true);
  };

  // 确认移动
  const handleMoveConfirm = async () => {
    if (!moveFileInfo || !moveTargetPath) return;

    const success = await handleMoveFile(Number(moveFileInfo.id), moveTargetPath);
    if (success) {
        setMoveModalVisible(false);
    }
  };

  // 右键菜单组件
  const contextMenu = rightClickedFile && (
    <Menu
      style={{
        position: "fixed",
        left: contextMenuPosition?.x,
        top: contextMenuPosition?.y,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      onClick={({ key }) => {
        if (key === "rename") {
          startRename(rightClickedFile.id.toString(), rightClickedFile.name);
          // 清除右键菜单状态，但保留重命名状态
          clearContextMenu();
        } else if (key === "move") {
          handleMove(rightClickedFile);
          // 清除右键菜单状态
          clearContextMenu();
        }
      }}
    >
      <Menu.Item key="rename">重命名</Menu.Item>
      <Menu.Item key="move">移动到</Menu.Item>
    </Menu>
  );

  return (
    <Content
      className={`content-main ${actionLoading ? "loading" : ""} ${viewType}`}
    >
      <OperationBar
        fileType={fileType}
        selectedRowKeys={selectedRowKeys}
        searchKeyword={searchKeyword}
        viewType={viewType}
        actionLoading={actionLoading}
        onFileUpload={handleFileUpload}
        onCreateFolder={() => setCreateFolderVisible(true)}
        onBatchDownload={() => handleBatchDownload(selectedRowKeys, clearSelection)}
        onBatchShare={() => handleBatchShare(selectedRowKeys, clearSelection)}
        onBatchCancelShare={() => handleBatchCancelShare(selectedRowKeys, clearSelection)}
        onBatchDelete={() => handleBatchDelete(selectedRowKeys, clearSelection)}
        onBatchRestore={() => handleBatchRestore(selectedRowKeys, clearSelection)}
        onBatchPermanentDelete={() => handleBatchPermanentDelete(selectedRowKeys, clearSelection)}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onViewTypeChange={setViewType}
      />
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
        {FILE_TYPE_CHECKS.isSharedFiles(fileType) ? (
          <div className="shared-files-container">
            {groupedSharedFiles.map((group) => {
              const groupSelectedCount = selectedRowKeys.filter((id) =>
                group.files.some((f) => f.id.toString() === id)
              ).length;
              return (
                <div key={group.shareKey} className="shared-group">
                  <div className="shared-group-header">
                    <div className="header-left">
                      <h3>分享（hadoop）/{group.shareKey}</h3>
                    </div>
                    <div className="share-actions">
                      <span className="share-link">{`${baseUrl}/share/${group.shareKey}`}</span>
                      <Button type="link" onClick={() => copyShareLink(group.shareKey)}>复制链接</Button>
                      <Button danger type="link" onClick={() => handleCancelShareGroup(group.shareKey)}>
                        取消该分享{groupSelectedCount > 0 ? `（已选 ${groupSelectedCount}）` : ''}
                      </Button>
                    </div>
                  </div>
                  <FileTable
                    fileList={group.files}
                    selectedRowKeys={selectedRowKeys}
                    loading={loading}
                    actionLoading={actionLoading}
                    fileType={fileType}
                    editingFileId={editingFileId}
                    editingFileName={editingFileName}
                    isRenaming={isRenaming}
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                    onSelectAll={handleSelectAll}
                    onSelect={handleSelect}
                    onFileClick={handleFileClick}
                    onSingleDownload={handleSingleDownload}
                    onSingleShare={handleSingleShare}
                    onSingleDelete={(record) => handleBatchCancelShare([record.id.toString()])}
                    onContextMenu={handleContextMenu}
                    onTableChange={handleTableChange}
                    onEditingFileNameChange={updateEditingFileName}
                    onRenameSubmit={handleRenameSubmit}
                    onRenameCancel={cancelRename}
                  />
                </div>
              );
            })}
          </div>
        ) : viewType === VIEW_TYPES.LIST ? (
          <FileTable
            fileList={fileList}
            selectedRowKeys={selectedRowKeys}
                  loading={loading}
            actionLoading={actionLoading}
            fileType={fileType}
            editingFileId={editingFileId}
            editingFileName={editingFileName}
            isRenaming={isRenaming}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={handleSelectAll}
            onSelect={handleSelect}
            onFileClick={handleFileClick}
            onSingleDownload={handleSingleDownload}
            onSingleShare={handleSingleShare}
            onSingleDelete={FILE_TYPE_CHECKS.isRecycleBin(fileType) ?
              async (record) => {
                // 回收站内的单行删除视为永久删除
                await handleBatchPermanentDelete([record.id.toString()]);
              } : FILE_TYPE_CHECKS.isSharedFiles(fileType) ?
              (record) => handleBatchCancelShare([record.id.toString()]) :
              handleSingleDelete}
            onSingleRestore={FILE_TYPE_CHECKS.isRecycleBin(fileType) ?
              async (record) => {
                await handleBatchRestore([record.id.toString()]);
              } : undefined}
            onContextMenu={handleContextMenu}
            onTableChange={handleTableChange}
            onEditingFileNameChange={updateEditingFileName}
            onRenameSubmit={handleRenameSubmit}
            onRenameCancel={cancelRename}
          />
        ) : (
          <FileGrid
            fileList={fileList}
            selectedRowKeys={selectedRowKeys}
            actionLoading={actionLoading}
            fileType={fileType}
            editingFileId={editingFileId}
            editingFileName={editingFileName}
            isRenaming={isRenaming}
            onSelect={handleSelect}
            onFileClick={handleFileClick}
            onSingleDownload={handleSingleDownload}
            onSingleShare={handleSingleShare}
            onSingleDelete={FILE_TYPE_CHECKS.isRecycleBin(fileType) ?
              async (record) => {
                await handleBatchPermanentDelete([record.id.toString()]);
              } : handleSingleDelete}
            onSingleRestore={FILE_TYPE_CHECKS.isRecycleBin(fileType) ?
              async (record) => {
                await handleBatchRestore([record.id.toString()]);
              } : undefined}
            onContextMenu={handleContextMenu}
            onEditingFileNameChange={updateEditingFileName}
            onRenameSubmit={handleRenameSubmit}
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
        onSubmit={handleCreateFolderSubmit}
      />

      {actionLoading && (
        <div className="global-loading-wrapper">
          <Spin indicator={antIcon} tip="正在处理..." />
        </div>
      )}
      
      {contextMenu}
      
      <Modal
        title="移动到"
        open={moveModalVisible}
        onOk={handleMoveConfirm}
        onCancel={() => setMoveModalVisible(false)}
        confirmLoading={actionLoading}
      >
        <Tree
          treeData={folderTree}
          defaultExpandAll
          icon={<FolderOutlined />}
          selectedKeys={[moveTargetPath]}
          onSelect={(selectedKeys) => {
            if (selectedKeys.length > 0) {
              setMoveTargetPath(selectedKeys[0].toString());
            }
          }}
        />
      </Modal>
    </Content>
  );
};

export default DiskContent;
