/*
 * @Date: 2025-01-15 20:00:00
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-01-15 20:00:00
 * @FilePath: \CloudDiskWeb\src\hooks\useUserProfile.ts
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, setUserProfile } from "@/store/modules/user";
import { removeToken, getToken } from "@/utils/setToken";
import { getUserProfile, updateUserProfile } from "@/api";
import { CACHE_CONFIG } from "@/constants/layoutConstants";

export const useUserProfile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username } = useAppSelector((state) => state.user);
  const userProfile = useAppSelector((state) => state.user.profile);

  // 检查是否需要重新获取用户信息
  const shouldFetchProfile = () => {
    const token = getToken();
    if (!token) return false;
    if (!userProfile) return true;

    const lastUpdateTime = localStorage.getItem(CACHE_CONFIG.PROFILE_UPDATE_TIME_KEY);
    if (!lastUpdateTime) return true;

    // 如果上次更新时间超过1小时，重新获取
    return Date.now() - parseInt(lastUpdateTime) > CACHE_CONFIG.PROFILE_CACHE_DURATION;
  };

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res.code === 0) {
        dispatch(setUserProfile(res.data));
        localStorage.setItem(CACHE_CONFIG.PROFILE_UPDATE_TIME_KEY, Date.now().toString());
      }
    } catch (err: any) {
      console.error("获取用户信息失败:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  // 更新用户信息
  const updateProfile = async (updateData: any) => {
    try {
      await updateUserProfile(updateData);
      message.success("个人信息更新成功");
      
      // 重新获取用户信息以更新界面显示
      const profileRes = await getUserProfile();
      if (profileRes.code === 0) {
        dispatch(setUserProfile(profileRes.data));
        localStorage.setItem(CACHE_CONFIG.PROFILE_UPDATE_TIME_KEY, Date.now().toString());
      }
      return true;
    } catch (error: any) {
      console.error("更新用户信息失败:", error);
      
      // 处理特定格式的错误响应 {"code":1002003001,"data":null,"msg":"手机号已经存在"}
      let errorMessage = "保存失败";
      
      // 现在 axios 直接返回响应数据，不再包装在 response.data 中
      if (error.msg) {
        // 直接包含 msg 字段 (主要格式)
        errorMessage = error.msg;
      } else if (error.message) {
        // 标准错误对象
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        // 字符串错误
        errorMessage = error;
      }
      
      message.error(errorMessage);
      return false;
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    removeToken();
    dispatch(logout());
    message.success("退出登录成功");
    navigate("/login", { replace: true });
  };

  // 在组件加载时获取用户信息
  useEffect(() => {
    if (shouldFetchProfile()) {
      fetchUserProfile();
    }
  }, []);

  return {
    userProfile,
    username,
    updateProfile,
    handleLogout,
    fetchUserProfile,
  };
};
