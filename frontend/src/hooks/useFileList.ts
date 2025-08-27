/**
 * 文件列表数据管理hook
 */
import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { getFileList } from "@/api/file";
import { FileInfo } from "@/types/file";
import { FileType } from "@/enums/FileTypeEnum";
import { DEFAULT_PAGINATION } from "@/constants/fileConstants";

interface FileListResponse {
  list: FileInfo[];
  total: number;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  msg?: string;
}

interface UseFileListProps {
  currentPath: string;
  fileType?: FileType;
  searchKeyword?: string;
}

interface SortState {
  field: string | null;
  order: "ascend" | "descend" | null;
}

export const useFileList = ({
  currentPath,
  fileType,
  searchKeyword = "",
}: UseFileListProps) => {
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [sortState, setSortState] = useState<SortState>({
    field: null,
    order: null,
  });

  // 加载文件列表
  const loadFileList = useCallback(async (
    page = 1,
    type: FileType | undefined = fileType,
    size: number = pagination.pageSize
  ) => {
    try {
      setLoading(true);
      const res = await getFileList({
        catalogue: type === undefined ? currentPath : undefined,
        type,
        name: searchKeyword,
        pageNo: page,
        pageSize: size,
        sortField: sortState.field || undefined,
        sortOrder: sortState.order || undefined,
        excludeShared: type !== 8,
      });

      if (res.code === 0 && res.data) {
        const data = (res as unknown as ApiResponse<FileListResponse>).data;
        const list = data.list || [];

        // 转换 createTime 类型
        let convertedList = list.map((item: FileInfo) => ({
          ...item,
          createTime: item.createTime.toString(),
        }));

        // 如果没有指定排序，使用默认排序：文件夹在前，按名称排序
        if (!sortState.field) {
          convertedList = convertedList.sort((a: FileInfo, b: FileInfo) => {
            // 首先按类型排序（文件夹在前）
            if (a.type !== b.type) {
              return b.type === FileType.DIRECTORY ? 1 : -1;
            }
            // 然后按名称排序
            return a.name.localeCompare(b.name);
          });
        }

        setFileList(convertedList);
        setPagination({
          current: page,
          pageSize: size,
          total: data.total || 0,
        });
      } else {
        setFileList([]);
        setPagination({
          current: 1,
          pageSize: size,
          total: 0,
        });
      }
    } catch (error) {
      setFileList([]);
      setPagination({
        current: 1,
        pageSize: size,
        total: 0,
      }); 
      console.error("Load file list error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPath, fileType, searchKeyword, sortState]);

  // 处理分页变化
  const handlePageChange = useCallback((page: number, size: number) => {
    loadFileList(page, fileType, size);
  }, [loadFileList, fileType]);

  // 处理每页条数变化
  const handlePageSizeChange = useCallback((_: number, size: number) => {
    loadFileList(1, fileType, size);
  }, [loadFileList, fileType]);

  // 处理表格排序变化
  const handleTableChange = useCallback((
    _: any,
    __: any,
    sorter: any
  ) => {
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const newSortState = {
      field: singleSorter.field as string,
      order: singleSorter.order as "ascend" | "descend" | null,
    };
    setSortState(newSortState);
    
    // 重新加载数据
    loadFileList(pagination.current, fileType);
  }, [loadFileList, pagination.current, fileType]);

  // 刷新数据
  const refreshFileList = useCallback(() => {
    loadFileList(pagination.current, fileType);
  }, [loadFileList, pagination.current, fileType]);

  // 监听依赖变化自动加载
  useEffect(() => {
    loadFileList(1, fileType);
  }, [currentPath, fileType]);

  return {
    fileList,
    loading,
    pagination,
    sortState,
    loadFileList,
    handlePageChange,
    handlePageSizeChange,
    handleTableChange,
    refreshFileList,
  };
};
