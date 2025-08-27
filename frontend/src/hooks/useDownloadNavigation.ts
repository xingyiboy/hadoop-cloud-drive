/**
 * 下载导航自动跳转Hook
 * 监听下载任务完成状态，自动跳转到相应页面
 */
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import { useDownloadStore } from "@/store/downloadStore";
import { DownloadTask } from "@/types/download";

interface UseDownloadNavigationProps {
  onTabChange?: (tab: number) => void;
}

export const useDownloadNavigation = ({ onTabChange }: UseDownloadNavigationProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const tasks = useDownloadStore((state) => state.tasks);
  
  // 使用ref来记录之前的任务状态，避免重复触发
  const prevTasksRef = useRef<DownloadTask[]>([]);
  // 标记是否是初次挂载，避免初始化时触发错误消息
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // 只在正在下载页面监听任务完成状态
    if (!location.pathname.includes("/download/downloading")) {
      return;
    }

    // 获取所有活跃的下载任务（待下载或正在下载的任务）
    const activeTasks = tasks.filter(
      (task) => task.status === "pending" || task.status === "downloading"
    );

    // 获取已完成的任务（成功或失败）
    const completedTasks = tasks.filter(
      (task) => task.status === "downloaded" || task.status === "failed"
    );

    // 获取成功下载的任务
    const successfulTasks = tasks.filter(
      (task) => task.status === "downloaded"
    );

    // 获取失败的任务
    const failedTasks = tasks.filter(
      (task) => task.status === "failed"
    );

    // 上一次的任务数量
    const prevTasks = prevTasksRef.current;
    const prevActiveTasks = prevTasks.filter(
      (task) => task.status === "pending" || task.status === "downloading"
    );
    const prevCompletedTasks = prevTasks.filter(
      (task) => task.status === "downloaded" || task.status === "failed"
    );

    // 检查是否有新的任务完成
    const hasNewCompletedTasks = completedTasks.length > prevCompletedTasks.length;
    
    // 如果是初次挂载，设置初始状态但不触发跳转
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      prevTasksRef.current = [...tasks];
      return;
    }
    
    // 计算本次新完成的任务（与上次状态对比）
    const prevSuccessfulTasks = prevTasks.filter((task) => task.status === "downloaded");
    const prevFailedTasks = prevTasks.filter((task) => task.status === "failed");
    
    const newSuccessfulTasks = successfulTasks.filter(task => 
      !prevSuccessfulTasks.some(prevTask => prevTask.id === task.id)
    );
    const newFailedTasks = failedTasks.filter(task => 
      !prevFailedTasks.some(prevTask => prevTask.id === task.id)
    );
    
    // 如果没有活跃任务了，且有已完成的任务，且有新任务完成，则考虑跳转
    if (
      activeTasks.length === 0 && 
      completedTasks.length > 0 && 
      hasNewCompletedTasks &&
      prevActiveTasks.length > 0  // 确保之前有活跃任务
    ) {
      // 延迟1秒后执行跳转，让用户看到完成状态
      setTimeout(() => {
        if (newSuccessfulTasks.length > 0) {
          // 如果有成功的任务，跳转到已下载页面
          if (onTabChange) {
            onTabChange(4); // 保持在下载tab
          }
          navigate("/download/downloaded");
          
          // 根据任务完成情况显示不同的消息（使用本次新完成的任务数量）
          if (newFailedTasks.length === 0) {
          } else {
            message.info(
              `下载任务完成！成功 ${newSuccessfulTasks.length} 个，失败 ${newFailedTasks.length} 个。已自动跳转到已下载页面`
            );
          }
        } else if (newFailedTasks.length > 0) {
          // 如果只有失败的任务，跳转到失败页面
          if (onTabChange) {
            onTabChange(4); // 保持在下载tab
          }
          navigate("/download/failed");
          message.error(`所有下载任务均失败！共 ${newFailedTasks.length} 个任务失败`);
        }
      }, 1000);
    }

    // 更新前一次的任务状态引用
    prevTasksRef.current = [...tasks];
  }, [tasks, navigate, location.pathname, onTabChange]);

  return {
    // 可以返回一些状态供组件使用
    activeTasks: tasks.filter(
      (task) => task.status === "pending" || task.status === "downloading"
    ),
    completedTasks: tasks.filter(
      (task) => task.status === "downloaded" || task.status === "failed"
    ),
    successfulTasks: tasks.filter(
      (task) => task.status === "downloaded"
    ),
    failedTasks: tasks.filter(
      (task) => task.status === "failed"
    ),
  };
};
