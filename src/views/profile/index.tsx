import { Card, Descriptions, Avatar, Tag } from "antd";
import { useAppSelector } from "@/store/hooks";
import "./index.scss";

const Profile = () => {
  const userProfile = useAppSelector((state) => state.user.profile);

  if (!userProfile) {
    return <div>加载中...</div>;
  }

  const getSexLabel = (sex: number) => {
    switch (sex) {
      case 1:
        return <Tag color="blue">男</Tag>;
      case 2:
        return <Tag color="pink">女</Tag>;
      default:
        return <Tag>未设置</Tag>;
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "未知";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="profile-container">
      <Card>
        <div className="profile-header">
          <Avatar size={120} src={userProfile.avatar} />
          <div className="profile-title">
            <h2>{userProfile.nickname || userProfile.username}</h2>
            <p>{userProfile.email || "未设置邮箱"}</p>
          </div>
        </div>
      </Card>

      <Card title="基本信息" className="profile-info" style={{ marginTop: 24 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="用户名">
            {userProfile.username}
          </Descriptions.Item>
          <Descriptions.Item label="昵称">
            {userProfile.nickname || "未设置"}
          </Descriptions.Item>
          <Descriptions.Item label="性别">
            {getSexLabel(userProfile.sex)}
          </Descriptions.Item>
          <Descriptions.Item label="手机号码">
            {userProfile.mobile || "未设置"}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">
            {userProfile.email || "未设置"}
          </Descriptions.Item>
          <Descriptions.Item label="最后登录IP">
            {userProfile.loginIp}
          </Descriptions.Item>
          <Descriptions.Item label="最后登录时间">
            {formatDate(userProfile.loginDate)}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {formatDate(userProfile.createTime)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile;
