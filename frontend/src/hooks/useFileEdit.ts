/**
 * 文件编辑状态管理hook
 */
import { useState, useCallback, useEffect } from "react";
import { FileInfo } from "@/types/file";

export const useFileEdit = () => {
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState<string>("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [rightClickedFile, setRightClickedFile] = useState<FileInfo | null>(null);

  // 开始重命名
  const startRename = useCallback((fileId: string, fileName: string) => {
    setEditingFileId(fileId);
    setEditingFileName(fileName);
  }, []);

  // 取消重命名
  const cancelRename = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingFileId(null);
    setEditingFileName("");
    setContextMenuPosition(null);
    setRightClickedFile(null);
  }, []);

  // 处理右键菜单
  const handleContextMenu = useCallback((e: React.MouseEvent, record: FileInfo) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setRightClickedFile(record);
  }, []);

  // 更新编辑中的文件名
  const updateEditingFileName = useCallback((value: string) => {
    setEditingFileName(value);
  }, []);

  // 设置重命名加载状态
  const setRenamingStatus = useCallback((status: boolean) => {
    setIsRenaming(status);
  }, []);

  // 清除右键菜单（不影响重命名状态）
  const clearContextMenu = useCallback(() => {
    setContextMenuPosition(null);
    setRightClickedFile(null);
  }, []);

  // 添加键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingFileId && e.key === "Escape") {
        cancelRename();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingFileId, cancelRename]);

  // 添加点击外部关闭右键菜单
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuPosition) {
        setContextMenuPosition(null);
        setRightClickedFile(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenuPosition]);

  return {
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
  };
};
