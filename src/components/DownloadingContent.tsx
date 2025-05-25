import React from "react";
import { List, Progress, Empty, Typography, Button, Modal, Layout } from "antd";
import { useLocation } from "react-router-dom";
import { useDownloadStore } from "../store/downloadStore";
import { formatFileSize } from "@/utils/format";
import { DeleteOutlined } from "@ant-design/icons";
import { DownloadStore, DownloadTask } from "../types/download";
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
    if (path === "/downloading") return "正在下载";
    if (path === "/downloaded") return "已下载";
    if (path === "/failed") return "下载失败";
    return "全部下载";
  };

  const getCurrentStatus = ():
    | "downloading"
    | "downloaded"
    | "failed"
    | undefined => {
    const path = location.pathname;
    if (path === "/downloading") return "downloading";
    if (path === "/downloaded") return "downloaded";
    if (path === "/failed") return "failed";
    return undefined;
  };

  const getFilteredTasks = () => {
    const status = getCurrentStatus();
    if (status) {
      return tasks.filter((task: DownloadTask) => task.status === status);
    }
    return tasks;
  };

  const getTaskStatusStyle = (
    status: "downloading" | "downloaded" | "failed"
  ): "success" | "danger" | undefined => {
    switch (status) {
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

  const getStatusText = (
    status: "downloading" | "downloaded" | "failed"
  ): string => {
    switch (status) {
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
                      {formatFileSize(task.file.size)}
                    </Text>
                  </div>
                  {task.status === "downloading" ? (
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

export default DownloadingContent;
