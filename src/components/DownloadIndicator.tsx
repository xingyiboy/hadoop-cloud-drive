import React, { useMemo } from "react";
import { Badge, Button } from "antd";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useDownloadStore } from "../store/downloadStore";
import { useNavigate } from "react-router-dom";
import { DownloadStore, DownloadTask } from "../types/download";
import "./DownloadIndicator.scss";

const DownloadIndicator: React.FC = () => {
  const tasks = useDownloadStore((state: DownloadStore) => state.tasks);
  const navigate = useNavigate();

  const { downloadingCount, totalCount } = useMemo(() => {
    const downloadingCount = tasks.filter(
      (task: DownloadTask) => task.status === "downloading"
    ).length;
    const totalCount = tasks.length;
    return {
      downloadingCount,
      totalCount,
    };
  }, [tasks]);

  if (totalCount === 0) {
    return null;
  }

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
          {downloadingCount > 0 ? "正在下载" : "等待下载"}
        </Badge>
      </Button>
    </div>
  );
};

export default DownloadIndicator;
