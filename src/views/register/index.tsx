/*
 * @Date: 2025-04-28 14:48:50
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-05-08 14:33:54
 * @FilePath: \CloudDiskWeb\src\views\register\index.tsx
 */
import "./index.scss";

import { Form, Input, Button, Checkbox, Avatar, Space, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";

import { useAppDispatch } from "@/store/hooks";
import { login } from "@/store/modules/user";

import { useNavigate } from "react-router-dom";
import { register } from "@/api";

function Register() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      // 验证两次密码是否一致
      if (values.password !== values.confirmPassword) {
        message.error("两次输入的密码不一致");
        return;
      }

      await register({
        username: values.username,
        nickname: values.nickname,
        password: values.password,
      });

      message.success("注册成功");
      // 跳转到登录页面并传递账号密码参数
      navigate("/login", {
        replace: true,
        state: {
          username: values.username,
          password: values.password,
        },
      });
    } catch (error: any) {
      message.error(error || "注册失败");
    }
  };

  //表单
  const [form] = Form.useForm();

  //页脚图标
  const IconFooter = ({ url, name }: { url: string; name: string }) => {
    return (
      <div className="icon-footer">
        <Avatar size={50} src={<img src={url} alt="avatar" />} />
        <div className="name">{name}</div>
      </div>
    );
  };
  const iconFooterUrl = [
    {
      url: "https://tse4-mm.cn.bing.net/th/id/OIP-C.5SvY9ldRrjIX0wEPm7iftAAAAA?w=181&h=181&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "经营性网站备案信息",
    },
    {
      url: "https://tse2-mm.cn.bing.net/th/id/OIP-C.zIV_gwbyg51ltVu8ZMUdoQHaHa?w=195&h=195&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "阅读网站值得信用",
    },
    {
      url: "https://tse3-mm.cn.bing.net/th/id/OIP-C.99hCBz1SGf8dHsS398h0cwHaHa?w=216&h=216&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "青岛网站都魔都网站",
    },
    {
      url: "https://tse1-mm.cn.bing.net/th/id/OIP-C.esEedh03Q09mRC_ovHoBYAHaHa?w=203&h=203&c=7&r=0&o=5&dpr=1.5&pid=1.7",
      name: "诚信网站",
    },
  ];

  return (
    <div className="register-page">
      <div className="header">
        <div className="left">
          <div className="logo">Hadoop</div>
          <div className="name">青软实训</div>
          <div className="shu">|</div>
          <div className="title"> 注册云端网盘账号</div>
        </div>
        <div className="right">
          <div className="link">已有账号</div>{" "}
          <div className="login" onClick={() => navigate("/login")}>
            登录
          </div>
        </div>
      </div>
      <div className="form">
        <div className="left">
          <div className="form-wrap">
            <Form form={form} size="large" onFinish={onFinish}>
              <Form.Item
                label="用户账号"
                name="username"
                rules={[
                  { required: true, message: "用户账号不能为空" },
                  {
                    pattern: /^[a-zA-Z0-9]{4,30}$/,
                    message: "用户账号由 数字、字母 组成",
                  },
                  { min: 4, max: 30, message: "用户账号长度为 4-30 个字符" },
                ]}
              >
                <Input placeholder="请输入用户账号" />
              </Form.Item>
              <Form.Item
                label="用户昵称"
                name="nickname"
                rules={[
                  { required: true, message: "用户昵称不能为空" },
                  { max: 30, message: "用户昵称长度不能超过 30 个字符" },
                ]}
              >
                <Input placeholder="请输入用户昵称" />
              </Form.Item>
              <Form.Item
                label="密码"
                name="password"
                rules={[
                  { required: true, message: "密码不能为空" },
                  { min: 4, max: 16, message: "密码长度为 4-16 位" },
                ]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item
                label="确认密码"
                name="confirmPassword"
                rules={[
                  { required: true, message: "确认密码不能为空" },
                  { min: 4, max: 16, message: "密码长度为 4-16 位" },
                ]}
              >
                <Input.Password placeholder="请再次输入密码进行确认" />
              </Form.Item>
              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[{ required: true, message: "请阅读并同意用户协议" }]}
              >
                <Checkbox>
                  <div className="link">
                    <div>我已阅读并同意《</div>
                    <div>Hadoop用户协议</div>
                    <div>》</div>
                  </div>
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Button type="primary" block htmlType="submit">
                  注册
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <div className="right">
          <div className="title">
            <Avatar
              size={30}
              src={
                <img
                  src={
                    "https://ts1.tc.mm.bing.net/th/id/OIP-C.esEedh03Q09mRC_ovHoBYAHaHa?w=200&h=211&c=8&rs=1&qlt=90&o=6&dpr=1.5&pid=3.1&rm=2"
                  }
                  alt="avatar"
                />
              }
            />
            账号注册说明
          </div>
          <div className="content">用户账号要求：</div>
          <div className="hint interleave">4-30位数字或字母组成</div>
          <div className="content">用户昵称要求：</div>
          <div className="hint interleave">不超过30个字符</div>
          <div className="content">密码要求：</div>
          <div className="hint">4-16位字符</div>
        </div>
      </div>
      <div className="footer2">
        <div className="center">
          {iconFooterUrl.map((item, index) => {
            return <IconFooter key={index} url={item.url} name={item.name} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default Register;
