import React, { useMemo } from "react";
import { Badge, Button } from "antd";
import { CloudUploadOutlined } from "@ant-design/icons";
import { useUploadStore } from "../store/uploadStore";
import { useNavigate } from "react-router-dom";
import "./UploadIndicator.scss";

const UploadIndicator: React.FC = () => {
  const tasks = useUploadStore((state) => state.tasks);
  const navigate = useNavigate();

  const { uploadingCount, totalCount } = useMemo(() => {
    const uploadingCount = tasks.filter(
      (task) => task.status === "uploading"
    ).length;
    const failedCount = tasks.filter((task) => task.status === "failed").length;
    const totalCount = tasks.length;
    return {
      uploadingCount,
      totalCount,
    };
  }, [tasks]);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="upload-indicator">
      <Button
        type="primary"
        icon={<CloudUploadOutlined />}
        onClick={() => navigate("/upload/uploading")}
      >
        <Badge
          count={totalCount}
          offset={[10, 0]}
          style={{
            backgroundColor: uploadingCount > 0 ? "#1890ff" : "#faad14",
          }}
        >
          {uploadingCount > 0 ? "正在上传" : "等待上传"}
        </Badge>
      </Button>
    </div>
  );
};

export default UploadIndicator;
