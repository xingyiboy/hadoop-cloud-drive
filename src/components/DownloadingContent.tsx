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
import { useDownloadStore } from "../store/downloadStore";
import { formatFileSize } from "@/utils/format";
import { DeleteOutlined } from "@ant-design/icons";
import { DownloadStore, DownloadTask, DownloadStatus } from "../types/download";
import "./DownloadingContent.scss";

const { Title, Text } = Typography;
const { Content } = Layout;

const DownloadingContent: React.FC = () => {
  const location = useLocation();
  const tasks = useDownloadStore((state: DownloadStore) => state.tasks);
  const clearTasksByStatus = useDownloadStore(
    (state: DownloadStore) => state.clearTasksByStatus
  );

  const getStatusTitle = (path: string): string => {
    if (path.includes("/download/downloading")) return "下载管理";
    if (path.includes("/download/downloaded")) return "已下载";
    if (path.includes("/download/failed")) return "下载失败";
    return "全部下载";
  };

  const getCurrentStatus = (): DownloadStatus | undefined => {
    const path = location.pathname;
    if (path.includes("/download/downloading")) return "downloading";
    if (path.includes("/download/downloaded")) return "downloaded";
    if (path.includes("/download/failed")) return "failed";
    return undefined;
  };

  const getFilteredTasks = () => {
    const status = getCurrentStatus();
    if (status === "downloading") {
      return tasks.filter(
        (task: DownloadTask) =>
          task.status === "downloading" || task.status === "pending"
      );
    }
    if (status) {
      return tasks.filter((task: DownloadTask) => task.status === status);
    }
    return tasks;
  };

  const getTaskStatusStyle = (
    status: DownloadStatus
  ): "warning" | "success" | "danger" | undefined => {
    switch (status) {
      case "pending":
        return "warning";
      case "downloading":
        return undefined;
      case "downloaded":
        return "success";
      case "failed":
        return "danger";
      default:
        return undefined;
    }
  };

  const getStatusText = (status: DownloadStatus): string => {
    switch (status) {
      case "pending":
        return "等待下载";
      case "downloading":
        return "正在下载";
      case "downloaded":
        return "下载完成";
      case "failed":
        return "下载失败";
      default:
        return "";
    }
  };

  const getStatusTag = (status: DownloadStatus) => {
    const colors = {
      pending: "gold",
      downloading: "processing",
      downloaded: "success",
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

  const filteredTasks = getFilteredTasks();

  return (
    <Content className="content-main">
      <div className="downloading-content">
        <div className="header-downloading">
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
            renderItem={(task: DownloadTask) => (
              <List.Item>
                <div className="task-item">
                  <div className="task-info">
                    <Text>{task.file.name}</Text>
                    <Text className="task-size">
                      {formatFileSize(
                        typeof task.file.size === "number"
                          ? task.file.size
                          : parseFloat(task.file.size)
                      )}
                    </Text>
                    {getStatusTag(task.status)}
                  </div>
                  {task.status === "downloading" ? (
                    <Progress percent={task.progress} status="active" />
                  ) : task.status === "pending" ? (
                    <div className="pending-status">
                      <Text type="warning">等待下载中...</Text>
                    </div>
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

export default DownloadingContent;
