import React, { useMemo } from "react";
import { Badge, Button } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useDownloadStore } from "../store/downloadStore";
import { useNavigate } from "react-router-dom";
import { DownloadStore, DownloadTask } from "../types/download";


const DownloadIndicator: React.FC = () => {
  const tasks = useDownloadStore((state: DownloadStore) => state.tasks);
  const navigate = useNavigate();

  const { downloadingCount, pendingCount, totalCount } = useMemo(() => {
    const downloadingCount = tasks.filter(
      (task: DownloadTask) => task.status === "downloading"
    ).length;
    const pendingCount = tasks.filter(
      (task: DownloadTask) => task.status === "pending"
    ).length;
    const totalCount = tasks.filter(
      (task: DownloadTask) =>
        task.status === "downloading" || task.status === "pending"
    ).length;
    return {
      downloadingCount,
      pendingCount,
      totalCount,
    };
  }, [tasks]);

  if (totalCount === 0) {
    return null;
  }

  const getStatusText = () => {
    if (downloadingCount > 0) return "正在下载";
    if (pendingCount > 0) return "等待下载";
    return "下载管理";
  };

  return (
    <div className="download-indicator">
      <Button
        type="primary"
        icon={<CloudDownloadOutlined />}
        onClick={() => navigate("/download/downloading")}
      >
        <Badge
          count={totalCount}
          offset={[10, 0]}
          style={{
            backgroundColor: downloadingCount > 0 ? "#1890ff" : "#faad14",
          }}
        >
          {getStatusText()}
        </Badge>
      </Button>
    </div>
  );
};

export default DownloadIndicator;
