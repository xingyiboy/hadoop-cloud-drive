/**
 * 文件选择管理hook
 */
import { useState, useCallback, useEffect } from "react";
import { FileInfo } from "@/types/file";

interface UseFileSelectionProps {
  fileList: FileInfo[];
  fileType?: number;
  currentPath: string;
}

export const useFileSelection = ({ fileList, fileType, currentPath }: UseFileSelectionProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loadedFileIds, setLoadedFileIds] = useState<Set<string>>(new Set());

  // 更新已加载文件ID缓存
  useEffect(() => {
    const newFileIds = new Set(loadedFileIds);
    fileList.forEach((file: FileInfo) => {
      newFileIds.add(file.id.toString());
    });
    setLoadedFileIds(newFileIds);
  }, [fileList]);

  // 处理全选
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      // 如果是全选，将当前页面的所有文件ID添加到已选中列表
      const currentPageIds = fileList.map((item) => item.id.toString());
      const newSelectedKeys = new Set([...selectedRowKeys, ...currentPageIds]);
      setSelectedRowKeys(Array.from(newSelectedKeys));
    } else {
      // 如果是取消全选，将当前页面的所有文件ID从已选中列表中移除
      const currentPageIds = new Set(
        fileList.map((item) => item.id.toString())
      );
      const newSelectedKeys = selectedRowKeys.filter(
        (key) => !currentPageIds.has(key)
      );
      setSelectedRowKeys(newSelectedKeys);
    }
  }, [fileList, selectedRowKeys]);

  // 处理单个选择
  const handleSelect = useCallback((checked: boolean, key: string) => {
    if (checked) {
      setSelectedRowKeys(prev => [...prev, key]);
    } else {
      setSelectedRowKeys(prev => prev.filter((k) => k !== key));
    }
  }, []);

  // 清除所有选择
  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
  }, []);

  // 检查全选状态
  const isAllSelected = fileList.length > 0 && 
    fileList.every((item) => selectedRowKeys.includes(item.id.toString()));

  // 检查部分选择状态
  const isIndeterminate = fileList.some((item) =>
    selectedRowKeys.includes(item.id.toString())
  ) && !isAllSelected;

  // 在搜索、切换文件类型和路径变化时清除选择
  useEffect(() => {
    clearSelection();
  }, [fileType, currentPath, clearSelection]);

  return {
    selectedRowKeys,
    setSelectedRowKeys,
    loadedFileIds,
    handleSelectAll,
    handleSelect,
    clearSelection,
    isAllSelected,
    isIndeterminate,
  };
};
