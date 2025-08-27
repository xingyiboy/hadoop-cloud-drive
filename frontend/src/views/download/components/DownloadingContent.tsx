import React, { useEffect } from "react";
import {
  List,
  Progress,
  Empty,
  Typography,
  Button,
  Modal,
  Layout,
  Tag,
  Space,
} from "antd";
import { useLocation } from "react-router-dom";
import { useDownloadStore } from "@/store/downloadStore";
import { useDownloadNavigation } from "@/hooks/useDownloadNavigation";
import { DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, CloseOutlined, PauseOutlined } from "@ant-design/icons";
import { DownloadStore, DownloadTask, DownloadStatus } from "@/types/download";


const { Title, Text } = Typography;
const { Content } = Layout;

interface DownloadingContentProps {
  onTabChange?: (tab: number) => void;
}

const DownloadingContent: React.FC<DownloadingContentProps> = ({ onTabChange }) => {
  const location = useLocation();
  const tasks = useDownloadStore((state: DownloadStore) => state.tasks);
  const clearTasksByStatus = useDownloadStore(
    (state: DownloadStore) => state.clearTasksByStatus
  );
  const pauseActiveDownloads = useDownloadStore(
    (state: DownloadStore) => state.pauseActiveDownloads
  );
  const pauseTask = useDownloadStore((state: DownloadStore) => state.pauseTask);
  const resumeTask = useDownloadStore((state: DownloadStore) => state.resumeTask);
  const resumeAllTasks = useDownloadStore(
    (state: DownloadStore) => state.resumeAllTasks
  );
  const removeTask = useDownloadStore((state: DownloadStore) => state.removeTask);

  // 页面刷新检测和任务取消逻辑
  useEffect(() => {
    // 检测是否为页面刷新进入
    const isPageRefresh = window.performance.navigation.type === 1 || 
                          (window.performance.getEntriesByType('navigation')[0] as any)?.type === 'reload';
    
    // 检测开发环境下的热更新（通过检查是否有 vite 的 hot 相关标识）
    const isHotReload = import.meta.env.DEV && (window as any).__vite_plugin_react_preamble_installed__;
    
    console.log('页面加载检测:', { 
      isPageRefresh, 
      isHotReload, 
      isDev: import.meta.env.DEV,
      navigationType: window.performance.navigation.type 
    });
    
    if (isPageRefresh && !isHotReload) {
      // 真正的页面刷新，暂停所有活跃任务
      const activeTasks = tasks.filter(task => 
        task.status === "pending" || task.status === "downloading"
      );
      
      if (activeTasks.length > 0) {
        console.log(`检测到页面刷新，暂停 ${activeTasks.length} 个活跃下载任务`);
        pauseActiveDownloads();
      }
    } else {
      // 正常导航或热更新，检查是否有最近创建的任务
      const now = Date.now();
      const hasRecentTasks = tasks.some(task => 
        (task.status === "pending" || task.status === "downloading") && 
        (now - task.createTime) < 5000 // 5秒内创建的任务
      );
      
      if (hasRecentTasks) {
        console.log('检测到正常的批量下载导航或热更新，保持任务活跃状态');
      } else if (!isHotReload) {
        // 如果不是热更新且没有最近任务，可能是异常情况
        const activeTasks = tasks.filter(task => 
          task.status === "pending" || task.status === "downloading"
        );
        if (activeTasks.length > 0) {
          console.log('检测到异常情况（非刷新但有旧的活跃任务），暂停这些任务');
          pauseActiveDownloads();
        }
      }
    }

    // 监听页面即将卸载，确保在刷新/关闭时暂停任务
    const handleBeforeUnload = () => {
      const activeTasks = tasks.filter(task => 
        task.status === "pending" || task.status === "downloading"
      );
      if (activeTasks.length > 0) {
        console.log('页面即将卸载，暂停所有活跃下载任务');
        pauseActiveDownloads();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // 空依赖数组确保只在组件挂载时执行一次

  // 启用下载完成自动跳转功能
  useDownloadNavigation({ onTabChange });

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
    let filteredTasks;
    
    if (status === "downloading") {
      filteredTasks = tasks.filter(
        (task: DownloadTask) =>
          task.status === "downloading" || task.status === "pending" || task.status === "paused"
      );
    } else if (status) {
      filteredTasks = tasks.filter((task: DownloadTask) => task.status === status);
    } else {
      filteredTasks = tasks;
    }
    
    // 按创建时间降序排序，最新的在前面
    return filteredTasks.sort((a, b) => b.createTime - a.createTime);
  };

  const getTaskStatusStyle = (
    status: DownloadStatus
  ): "warning" | "success" | "danger" | undefined => {
    switch (status) {
      case "pending":
        return "warning";
      case "downloading":
        return undefined;
      case "paused":
        return "warning";
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
      case "paused":
        return "已暂停";
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
      paused: "default",
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
    let statusText = "";
    let contentText = "";
    
    if (status === "downloading") {
      statusText = "正在下载的";
      contentText = "确定要清空所有正在下载的任务吗？此操作将删除所有正在下载、等待下载和已暂停的任务记录。";
    } else if (status === "downloaded") {
      statusText = "已下载的";
      contentText = "确定要清空所有已下载的任务吗？此操作将删除所有已完成下载的任务记录。";
    } else if (status === "failed") {
      statusText = "下载失败的";
      contentText = "确定要清空所有下载失败的任务吗？此操作将删除所有失败的任务记录。";
    } else {
      statusText = "所有";
      contentText = "确定要清空所有任务吗？此操作将删除所有下载任务记录。";
    }

    Modal.confirm({
      title: "确认清空",
      content: contentText,
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        if (status === "downloading") {
          // 清空正在下载页面的所有相关任务
          // 需要分别清空每种状态，因为clearTasksByStatus一次只能清空一种状态
          ["downloading", "pending", "paused"].forEach(taskStatus => {
            const hasTasks = tasks.some(task => task.status === taskStatus);
            if (hasTasks) {
              clearTasksByStatus(taskStatus as any);
            }
          });
        } else if (status) {
          // 清空特定状态的任务
          clearTasksByStatus(status);
        } else {
          // 清空所有任务
          clearTasksByStatus();
        }
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
            <Space>
              {/* 全部暂停按钮 - 只在有活跃任务时显示 */}
              {filteredTasks.some(task => task.status === "downloading" || task.status === "pending") && (
                <Button
                  icon={<PauseOutlined />}
                  onClick={() => pauseActiveDownloads()}
                >
                  全部暂停
                </Button>
              )}
              
              {/* 全部开启按钮 - 只在有暂停任务时显示 */}
              {filteredTasks.some(task => task.status === "paused") && (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => resumeAllTasks()}
                >
                  全部开启
                </Button>
              )}
              
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearTasks}
              >
                全部清空
              </Button>
            </Space>
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
                      {task.originalSize+"MB" || "-"}
                    </Text>
                    {getStatusTag(task.status)}
                    {/* 任务控制按钮 */}
                    <div className="task-controls">
                      {/* 暂停/恢复按钮 */}
                      {task.status === "downloading" || task.status === "pending" ? (
                        <Button
                          type="text"
                          size="small"
                          icon={<PauseCircleOutlined />}
                          onClick={() => pauseTask(task.id)}
                          title="暂停下载"
                        />
                      ) : task.status === "paused" ? (
                        <Button
                          type="text"
                          size="small"
                          icon={<PlayCircleOutlined />}
                          onClick={() => resumeTask(task.id)}
                          title="恢复下载"
                        />
                      ) : null}
                      
                      {/* 删除按钮 */}
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => removeTask(task.id)}
                        title="删除任务"
                        className="delete-task-btn"
                      />
                    </div>
                  </div>
                  <div className="task-bottom">
                    <div className="task-status">
                      {task.status === "downloading" ? (
                        <Progress percent={task.progress} status="active" />
                      ) : task.status === "pending" ? (
                        <div className="pending-status">
                          <Text type="warning">等待下载中...</Text>
                        </div>
                      ) : task.status === "paused" ? (
                        <div className="paused-status">
                          <Text type="warning">已暂停</Text>
                          {task.progress > 0 && (
                            <Progress percent={task.progress} status="normal" />
                          )}
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

export default DownloadingContent;
