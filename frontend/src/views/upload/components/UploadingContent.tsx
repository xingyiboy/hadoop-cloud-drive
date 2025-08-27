import React from "react";
import {
  List,
  Progress,
  Empty,
  Typography,
  Button,
  Modal,
  Layout,
  Tag,
} from "antd";
import { useLocation } from "react-router-dom";
import { useUploadStore } from "@/store/uploadStore";
import { formatFileSize } from "@/utils/format";
import { DeleteOutlined, CloseOutlined } from "@ant-design/icons";


const { Title, Text } = Typography;
const { Content } = Layout;

const UploadingContent: React.FC = () => {
  const location = useLocation();
  const tasks = useUploadStore((state) => state.tasks);
  const clearTasksByStatus = useUploadStore(
    (state) => state.clearTasksByStatus
  );
  const removeTask = useUploadStore((state) => state.removeTask);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const getStatusTitle = (path: string): string => {
    if (path.includes("uploading")) return "正在上传";
    if (path.includes("success")) return "已上传";
    if (path.includes("failed")) return "上传失败";
    return "全部上传";
  };

  const getCurrentStatus = ():
    | "pending"
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
    let filteredTasks;
    
    if (status === "uploading") {
      // 显示正在上传和等待上传的任务
      filteredTasks = tasks.filter(
        (task) => task.status === "uploading" || task.status === "pending"
      );
    } else if (status) {
      filteredTasks = tasks.filter((task) => task.status === status);
    } else {
      filteredTasks = tasks;
    }
    
    // 按创建时间降序排序，最新的在前面
    return filteredTasks.sort((a, b) => b.createTime - a.createTime);
  };

  const getTaskStatusStyle = (
    status: "pending" | "uploading" | "success" | "failed"
  ): "success" | "warning" | "danger" | undefined => {
    switch (status) {
      case "pending":
        return "warning";
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
    status: "pending" | "uploading" | "success" | "failed"
  ): string => {
    switch (status) {
      case "pending":
        return "等待上传";
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

  const getStatusTag = (
    status: "pending" | "uploading" | "success" | "failed"
  ) => {
    const colors = {
      pending: "gold",
      uploading: "processing",
      success: "success",
      failed: "error",
    };

    return (
      <Tag color={colors[status]} style={{ marginLeft: 8 }}>
        {getStatusText(status)}
      </Tag>
    );
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

  const handleRemoveTask = (taskId: string) => {
    removeTask(taskId);
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
                    <Text>{task.fileName}</Text>
                    <Text className="task-size">
                      {formatFileSize(task.sizeInBytes)}
                    </Text>
                    {getStatusTag(task.status)}
                    <div className="task-controls">
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => handleRemoveTask(task.id)}
                        title="删除任务"
                        className="delete-task-btn"
                      />
                    </div>
                  </div>
                  <div className="task-bottom">
                    <div className="task-status">
                      {task.status === "uploading" ? (
                        <Progress percent={task.progress} status="active" />
                      ) : task.status === "pending" ? (
                        <div className="pending-status">
                          <Text type="warning">等待上传中...</Text>
                        </div>
                      ) : (
                        <Text type={getTaskStatusStyle(task.status)}>
                          {getStatusText(task.status)}
                          {task.error && `: ${task.error}`}
                        </Text>
                      )}
                    </div>
                    <div className="task-time">
                      <Text className="time-text">
                        {formatTime(task.createTime)}
                      </Text>
                    </div>
                  </div>
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
