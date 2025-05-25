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
    if (path.includes("completed")) return "上传成功";
    if (path.includes("error")) return "上传失败";
    return "全部上传";
  };

  const getFilteredTasks = () => {
    if (location.pathname.includes("uploading")) {
      return tasks.filter(
        (task) => task.status === "uploading" || task.status === "pending"
      );
    }
    if (location.pathname.includes("completed")) {
      return tasks.filter((task) => task.status === "completed");
    }
    if (location.pathname.includes("error")) {
      return tasks.filter((task) => task.status === "error");
    }
    return tasks;
  };

  const getTaskStatusStyle = (
    status: "pending" | "uploading" | "completed" | "error"
  ): "success" | "danger" | undefined => {
    switch (status) {
      case "pending":
      case "uploading":
        return undefined;
      case "completed":
        return "success";
      case "error":
        return "danger";
      default:
        return undefined;
    }
  };

  const getStatusText = (
    status: "pending" | "uploading" | "completed" | "error"
  ): string => {
    switch (status) {
      case "pending":
        return "等待上传";
      case "uploading":
        return "正在上传";
      case "completed":
        return "上传完成";
      case "error":
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
                {task.status === "uploading" || task.status === "pending" ? (
                  <Progress
                    percent={task.progress}
                    status={task.status === "pending" ? "normal" : "active"}
                  />
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
