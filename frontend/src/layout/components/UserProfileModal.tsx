/*
 * @Date: 2025-01-15 20:00:00
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-01-15 20:00:00
 * @FilePath: \CloudDiskWeb\src\layout\components\UserProfileModal.tsx
 */

import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Select,
  Avatar,
  message,
} from "antd";
import { EditOutlined, LockOutlined } from "@ant-design/icons";
import { DEFAULT_AVATAR } from "@/constants/layoutConstants";
import type { UserProfile } from "@/types/user";

interface UserProfileModalProps {
  visible: boolean;
  userProfile: UserProfile | null;
  onCancel: () => void;
  onSave: (data: any) => Promise<boolean>;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  userProfile,
  onCancel,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleEditProfile = () => {
    setIsEditing(true);
    form.setFieldsValue({
      nickname: userProfile?.nickname,
      email: userProfile?.email,
      mobile: userProfile?.mobile,
      sex: userProfile?.sex === 0 ? undefined : userProfile?.sex,
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const updateData = {
        nickname: values.nickname,
        email: values.email,
        mobile: values.mobile,
        sex: values.sex,
      };

      const success = await onSave(updateData);
      if (success) {
        setIsEditing(false);
        // 成功和失败提示都已经在 onSave 函数中处理了
      }
    } catch (error: any) {
      // 只处理表单验证错误，其他错误已经在 onSave 中处理
      console.error("表单验证失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="个人信息"
      open={visible}
      onCancel={handleCancel}
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
          sex: userProfile?.sex === 0 ? undefined : userProfile?.sex,
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
            src={userProfile?.avatar || DEFAULT_AVATAR}
          />
        </div>

        <div className="form-content">
          <div className="form-row">
            <Form.Item
              label="用户ID"
              name="id"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              className="readonly-field"
            >
              <Input 
                disabled 
                style={{ backgroundColor: '#f5f5f5', border: '1px solid #e8e8e8' }}
              />
            </Form.Item>

            <Form.Item
              label="用户名"
              name="username"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              className="readonly-field"
            >
              <Input 
                disabled 
                style={{ backgroundColor: '#f5f5f5', border: '1px solid #e8e8e8' }}
              />
            </Form.Item>

            <Form.Item
              label="昵称"
              name="nickname"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              className={isEditing ? "editable-field" : "readonly-field"}
              rules={[{ required: true, message: "请输入昵称" }]}
            >
              <Input 
                disabled={!isEditing}
                style={isEditing ? 
                  { backgroundColor: '#fff', border: '2px solid #1890ff', boxShadow: '0 0 4px rgba(24, 144, 255, 0.3)' } : 
                  { backgroundColor: '#f5f5f5', border: '1px solid #e8e8e8' }
                }
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="邮箱"
              name="email"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              className={isEditing ? "editable-field" : "readonly-field"}
              rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
            >
              <Input 
                disabled={!isEditing} 
                style={isEditing ? 
                  { backgroundColor: '#fff', border: '2px solid #1890ff', boxShadow: '0 0 4px rgba(24, 144, 255, 0.3)' } : 
                  { backgroundColor: '#f5f5f5', border: '1px solid #e8e8e8' }
                }
              />
            </Form.Item>

            <Form.Item
              label="手机号"
              name="mobile"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              className={isEditing ? "editable-field" : "readonly-field"}
              rules={[
                { required: true, message: "请输入手机号" },
                { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
              ]}
            >
              <Input 
                disabled={!isEditing} 
                style={isEditing ? 
                  { backgroundColor: '#fff', border: '2px solid #1890ff', boxShadow: '0 0 4px rgba(24, 144, 255, 0.3)' } : 
                  { backgroundColor: '#f5f5f5', border: '1px solid #e8e8e8' }
                }
              />
            </Form.Item>

            <Form.Item
              label="性别"
              name="sex"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              className={isEditing ? "editable-field" : "readonly-field"}
            >
              <Select 
                disabled={!isEditing}
                style={isEditing ? 
                  { backgroundColor: '#fff', border: '2px solid #1890ff', boxShadow: '0 0 4px rgba(24, 144, 255, 0.3)', width: '100%' } : 
                  { backgroundColor: '#f5f5f5', border: '1px solid #e8e8e8', width: '100%' }
                }
              >
                <Select.Option value={1}>男</Select.Option>
                <Select.Option value={2}>女</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="form-row form-row-two">
            <Form.Item
              label="登录IP"
              name="loginIp"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 30 }}
              className="readonly-field"
            >
              <Input 
                disabled 
                style={{ backgroundColor: '#f5f5f5', border: '1px solid #e8e8e8' }}
              />
            </Form.Item>

            <Form.Item
              label="登录时间"
              name="loginDate"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 30 }}
              className="readonly-field"
            >
              <Input 
                disabled 
                style={{ backgroundColor: '#f5f5f5', border: '1px solid #e8e8e8' }}
              />
            </Form.Item>

            <div style={{ flex: 1 }}></div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          {!isEditing ? (
            <Button type="primary" onClick={handleEditProfile}>
              编辑信息
            </Button>
          ) : (
            <Space size="middle">
              <Button onClick={handleCancelEdit} disabled={loading}>取消</Button>
              <Button 
                type="primary" 
                onClick={handleSaveProfile}
                loading={loading}
              >
                保存
              </Button>
            </Space>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default UserProfileModal;
