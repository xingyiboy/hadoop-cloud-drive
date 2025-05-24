/*
 * @Date: 2025-05-09 12:03:12
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-24 17:33:18
 * @FilePath: \CloudDiskWeb\src\layout\component\HeaderMain.tsx
 */
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Dropdown,
  Menu,
  message,
  Modal,
  Form,
  Input,
  Button,
  Space,
  Radio,
  Select,
} from "antd";
import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, setUserProfile } from "@/store/modules/user";
import type { MenuProps } from "antd";
import { Layout } from "antd";

import "../style/header-main.scss";
import { removeToken, getToken } from "@/utils/setToken";
import { getUserProfile, updateUserProfile } from "@/api";

const { Header } = Layout;

const items1: MenuProps["items"] = [
  { key: 1, label: "网盘" },
  { key: 2, label: "分享" },
  { key: 3, label: "正在上传" },
  { key: 4, label: "正在下载" },
];

function HeaderMain() {
  const navigate = useNavigate(); //允许使用编程式导航
  const dispatch = useAppDispatch();
  const { username } = useAppSelector((state) => state.user);
  const userProfile = useAppSelector((state) => state.user.profile);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  // 在组件加载时获取用户信息
  useEffect(() => {
    const token = getToken();
    // 如果有token但没有用户信息，或者用户信息已过期（超过1小时），则重新获取
    const shouldFetchProfile = () => {
      if (!token) return false;
      if (!userProfile) return true;

      const lastUpdateTime = localStorage.getItem("profileUpdateTime");
      if (!lastUpdateTime) return true;

      // 如果上次更新时间超过1小时，重新获取
      const ONE_HOUR = 60 * 60 * 1000;
      return Date.now() - parseInt(lastUpdateTime) > ONE_HOUR;
    };

    if (shouldFetchProfile()) {
      getUserProfile()
        .then((res) => {
          if (res.code === 0) {
            dispatch(setUserProfile(res.data));
            // 记录更新时间
            localStorage.setItem("profileUpdateTime", Date.now().toString());
          }
        })
        .catch((err) => {
          console.error("获取用户信息失败:", err);
          if (err.response?.status === 401) {
            removeToken();
            dispatch(logout());
            navigate("/login", { replace: true });
          }
        });
    }
  }, []);

  const handleLogout = () => {
    // 只清除token，不清除保存的账号密码
    removeToken();
    // 清除用户状态
    dispatch(logout());
    message.success("退出登录成功");
    // 跳转到登录页
    navigate("/login", { replace: true });
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "profile":
        setIsProfileModalVisible(true);
        break;
      case "logout":
        handleLogout();
        break;
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    form.setFieldsValue({
      nickname: userProfile?.nickname,
      email: userProfile?.email,
      mobile: userProfile?.mobile,
      sex: userProfile?.sex,
    });
  };

  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      const updateData = {
        nickname: values.nickname,
        email: values.email,
        mobile: values.mobile,
        sex: values.sex,
      };

      try {
        const res = await updateUserProfile(updateData);
        message.success("个人信息更新成功");
        // 重新获取用户信息以更新界面显示
        const profileRes = await getUserProfile();
        if (profileRes.code === 0) {
          dispatch(setUserProfile(profileRes.data));
          localStorage.setItem("profileUpdateTime", Date.now().toString());
        }
        setIsEditing(false);
      } catch (error: any) {
        // 直接显示后端返回的错误信息
        message.error(error || "保存失败");
      }
    } catch (error: any) {
      // 表单验证错误
      message.error(error.message || "表单验证失败");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile">个人信息</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">退出登录</Menu.Item>
    </Menu>
  );

  return (
    <>
      <Header
        className="header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <div className="left">
          <div className="logo">QST</div>
          <div className="logo-title">云端网盘</div>
          <Menu
            className="menu"
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={["1"]}
            items={items1}
            style={{ flex: 1, minWidth: 0 }}
          />
        </div>
        <div className="right">
          <Space size={13}>
            <Dropdown overlay={menu} trigger={["click"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Avatar
                  size={35}
                  src={
                    <img
                      src={
                        userProfile?.avatar ||
                        "https://ts3.tc.mm.bing.net/th/id/OIP-C.g5M-iZUiocFCi9YAzojtRAAAAA?w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2"
                      }
                      alt="avatar"
                    />
                  }
                />
                <div style={{ marginLeft: "8px" }}>
                  {userProfile?.nickname || userProfile?.username || "未登录"}
                </div>
              </div>
            </Dropdown>
            <div>|</div>
            <div>当前目录: {localStorage.getItem("currentPath") || "/"}</div>
            <Button shape="round" danger type="primary">
              会员中心
            </Button>
          </Space>
        </div>
      </Header>

      <Modal
        title="个人信息"
        open={isProfileModalVisible}
        onCancel={() => {
          setIsProfileModalVisible(false);
          setIsEditing(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="horizontal"
          initialValues={{
            id: userProfile?.id,
            username: userProfile?.username,
            nickname: userProfile?.nickname,
            email: userProfile?.email,
            mobile: userProfile?.mobile,
            sex: userProfile?.sex,
            loginIp: userProfile?.loginIp,
            loginDate: userProfile?.loginDate
              ? new Date(userProfile.loginDate).toLocaleString()
              : "未登录",
          }}
          className="profile-form"
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Avatar
              size={100}
              src={
                userProfile?.avatar ||
                "https://ts3.tc.mm.bing.net/th/id/OIP-C.g5M-iZUiocFCi9YAzojtRAAAAA?w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2"
              }
            />
          </div>

          <div className="form-content">
            <div className="form-row">
              <Form.Item
                label="用户ID"
                name="id"
                labelCol={{ flex: "100px" }}
                wrapperCol={{ flex: "auto" }}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="用户名"
                name="username"
                labelCol={{ flex: "100px" }}
                wrapperCol={{ flex: "auto" }}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="昵称"
                name="nickname"
                labelCol={{ flex: "100px" }}
                wrapperCol={{ flex: "auto" }}
              >
                <Input disabled={!isEditing} />
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item
                label="邮箱"
                name="email"
                labelCol={{ flex: "100px" }}
                wrapperCol={{ flex: "auto" }}
                rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
              >
                <Input disabled={!isEditing} />
              </Form.Item>

              <Form.Item
                label="手机号"
                name="mobile"
                labelCol={{ flex: "100px" }}
                wrapperCol={{ flex: "auto" }}
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
                ]}
              >
                <Input disabled={!isEditing} />
              </Form.Item>

              <Form.Item
                label="性别"
                name="sex"
                labelCol={{ flex: "100px" }}
                wrapperCol={{ flex: "auto" }}
              >
                <Select disabled={!isEditing}>
                  <Select.Option value={1}>男</Select.Option>
                  <Select.Option value={2}>女</Select.Option>
                  <Select.Option value={0}>未设置</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item
                label="最后登录IP"
                name="loginIp"
                labelCol={{ flex: "100px" }}
                wrapperCol={{ flex: "auto" }}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="最后登录"
                name="loginDate"
                labelCol={{ flex: "100px" }}
                wrapperCol={{ flex: "auto" }}
              >
                <Input disabled />
              </Form.Item>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            {!isEditing ? (
              <Button type="primary" onClick={handleEditProfile}>
                编辑信息
              </Button>
            ) : (
              <Space size="middle">
                <Button onClick={handleCancelEdit}>取消</Button>
                <Button type="primary" onClick={handleSaveProfile}>
                  保存
                </Button>
              </Space>
            )}
          </div>
        </Form>
      </Modal>
    </>
  );
}

export default HeaderMain;
