import { useState, useEffect } from "react";
import { message } from "antd";
import request from "@/utils/request";
import { SHARE_CONSTANTS } from "@/constants/fileConstants";
import type { FileInfo } from "@/types/file";

interface UseShareFilesResult {
  loading: boolean;
  fileList: FileInfo[];
  error: string | null;
  handleDownload: (fileName: string) => Promise<void>;
  loadShareFiles: () => Promise<void>;
}

export const useShareFiles = (shareKey?: string): UseShareFilesResult => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 加载分享文件列表
  const loadShareFiles = async () => {
    if (!shareKey) return;

    try {
      setLoading(true);
      setError(null);
      const res = await request.get(SHARE_CONSTANTS.API_ENDPOINTS.GET_SHARE_FILES(shareKey));
      
      if (res.code === 0 && res.data) {
        setFileList(res.data);
      } else {
        const errorMessage = res.msg || SHARE_CONSTANTS.ERROR_MESSAGES.LOAD_FAILED;
        setError(errorMessage);
        message.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = SHARE_CONSTANTS.ERROR_MESSAGES.LOAD_FAILED;
      setError(errorMessage);
      message.error(errorMessage);
      console.error("Load share files error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 下载文件
  const handleDownload = async (fileName: string) => {
    if (!shareKey) return;

    try {
      const response = await request.get(
        SHARE_CONSTANTS.API_ENDPOINTS.DOWNLOAD_SHARED(shareKey, fileName),
        { responseType: "blob" }
      );

      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(SHARE_CONSTANTS.ERROR_MESSAGES.DOWNLOAD_FAILED);
      console.error("Download error:", error);
    }
  };

  useEffect(() => {
    if (shareKey) {
      loadShareFiles();
    }
  }, [shareKey]);

  return {
    loading,
    fileList,
    error,
    handleDownload,
    loadShareFiles,
  };
};
