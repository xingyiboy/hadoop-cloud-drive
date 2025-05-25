import React from "react";
import { List, Progress, Empty, Typography } from "antd";
import { useLocation } from "react-router-dom";
import { useUploadStore } from "@/store/uploadStore";
import { formatFileSize } from "@/utils/format";
import "./UploadingContent.scss";

const { Title, Text } = Typography;

const UploadingContent: React.FC = () => {
  const location = useLocation();
  const tasks = useUploadStore((state) => state.tasks);

  const getStatusTitle = (path: string): string => {
    if (path.includes("uploading")) return "正在上传";
    if (path.includes("success")) return "已上传";
    if (path.includes("failed")) return "上传失败";
    return "全部上传";
  };

  const getFilteredTasks = () => {
    if (location.pathname.includes("uploading")) {
      return tasks.filter((task) => task.status === "uploading");
    }
    if (location.pathname.includes("success")) {
      return tasks.filter((task) => task.status === "success");
    }
    if (location.pathname.includes("failed")) {
      return tasks.filter((task) => task.status === "failed");
    }
    return tasks;
  };

  const getTaskStatusStyle = (
    status: "uploading" | "success" | "failed"
  ): "success" | "danger" | undefined => {
    switch (status) {
      case "uploading":
        return undefined;
      case "success":
        return "success";
      case "failed":
        return "danger";
      default:
        return undefined;
    }
  };

  const getStatusText = (
    status: "uploading" | "success" | "failed"
  ): string => {
    switch (status) {
      case "uploading":
        return "正在上传";
      case "success":
        return "上传完成";
      case "failed":
        return "上传失败";
      default:
        return "";
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="uploading-content">
      <Title level={4} className="page-title">
        {getStatusTitle(location.pathname)}
      </Title>
      {filteredTasks.length > 0 ? (
        <List
          className="task-list"
          dataSource={filteredTasks}
          renderItem={(task) => (
            <List.Item>
              <div className="task-item">
                <div className="task-info">
                  <Text>{task.file.name}</Text>
                  <Text className="task-size">
                    {formatFileSize(task.file.size)}
                  </Text>
                </div>
                {task.status === "uploading" ? (
                  <Progress percent={task.progress} status="active" />
                ) : (
                  <Text type={getTaskStatusStyle(task.status)}>
                    {getStatusText(task.status)}
                    {task.error && `: ${task.error}`}
                  </Text>
                )}
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty description={<span className="empty-text">暂无任务</span>} />
      )}
    </div>
  );
};

export default UploadingContent;
