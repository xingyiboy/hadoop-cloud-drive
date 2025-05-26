import React from "react";
import { List, Progress, Empty, Typography, Button, Modal, Layout } from "antd";
import { useLocation } from "react-router-dom";
import { useUploadStore } from "@/store/uploadStore";
import { formatFileSize } from "@/utils/format";
import { DeleteOutlined } from "@ant-design/icons";
import "./UploadingContent.scss";

const { Title, Text } = Typography;
const { Content } = Layout;

const UploadingContent: React.FC = () => {
  const location = useLocation();
  const tasks = useUploadStore((state) => state.tasks);
  const clearTasksByStatus = useUploadStore(
    (state) => state.clearTasksByStatus
  );

  const getStatusTitle = (path: string): string => {
    if (path.includes("uploading")) return "正在上传";
    if (path.includes("success")) return "已上传";
    if (path.includes("failed")) return "上传失败";
    return "全部上传";
  };

  const getCurrentStatus = ():
    | "uploading"
    | "success"
    | "failed"
    | undefined => {
    if (location.pathname.includes("uploading")) return "uploading";
    if (location.pathname.includes("success")) return "success";
    if (location.pathname.includes("failed")) return "failed";
    return undefined;
  };

  const getFilteredTasks = () => {
    const status = getCurrentStatus();
    if (status) {
      return tasks.filter((task) => task.status === status);
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

  const handleClearTasks = () => {
    const status = getCurrentStatus();
    const statusText = status ? getStatusText(status) : "所有";
    Modal.confirm({
      title: "确认清空",
      content: `确定要清空${statusText}任务吗？`,
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        clearTasksByStatus(status);
      },
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <Content className="content-main">
      <div className="uploading-content">
        <div className="header-uploading">
          <Title level={4} className="page-title">
            {getStatusTitle(location.pathname)}
          </Title>
          {filteredTasks.length > 0 && (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleClearTasks}
            >
              清空
            </Button>
          )}
        </div>
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
    </Content>
  );
};

export default UploadingContent;
