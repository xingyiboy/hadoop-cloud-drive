import { Layout, Button, Input, Table, Checkbox } from "antd";
import {
  UploadOutlined,
  FolderAddOutlined,
  CloudDownloadOutlined,
  SettingOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
  FolderOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import "../style/content-main.scss";

const { Content } = Layout;

function ContentMain() {
  // 选中的文件keys
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  // 示例数据
  const data = [
    {
      key: "1",
      fileName: "qst",
      type: "目录",
      size: "-",
      modifyDate: "2022-08-23 06:44:32",
    },
    {
      key: "2",
      fileName: "test",
      type: "文件",
      size: "-",
      modifyDate: "2022-08-23 06:44:32",
    },
  ];

  // 文件点击处理函数
  const handleFileClick = (fileName: string) => {
    console.log("点击文件:", fileName);
    // 这里可以添加文件点击后的逻辑
  };

  // 处理全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(data.map((item) => item.key));
    } else {
      setSelectedRowKeys([]);
    }
  };

  // 处理单个选择
  const handleSelect = (checked: boolean, key: string) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, key]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== key));
    }
  };

  // 获取文件图标
  const getFileIcon = (type: string) => {
    if (type === "目录") {
      return <span className="folder-icon">📁</span>;
    }
    return <span className="file-icon">📄</span>;
  };

  // 表格列定义
  const columns = [
    {
      title: (
        <div className="file-name-header">
          <Checkbox
            checked={data.length > 0 && selectedRowKeys.length === data.length}
            indeterminate={
              selectedRowKeys.length > 0 && selectedRowKeys.length < data.length
            }
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span>文件名</span>
        </div>
      ),
      dataIndex: "fileName",
      key: "fileName",
      render: (text: string, record: any) => (
        <div className="file-name-cell">
          <Checkbox
            checked={selectedRowKeys.includes(record.key)}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleSelect(e.target.checked, record.key)}
          />
          <div
            className="file-name-content"
            onClick={() => handleFileClick(text)}
          >
            {getFileIcon(record.type)}
            <span className="file-name-text">{text}</span>
          </div>
        </div>
      ),
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "大小",
      dataIndex: "size",
      key: "size",
    },
    {
      title: "修改日期",
      dataIndex: "modifyDate",
      key: "modifyDate",
    },
  ];

  return (
    <Content className="content-main">
      <div className="operation-bar">
        <div className="left-buttons">
          <Button type="primary" icon={<UploadOutlined />}>
            上传
          </Button>
          <Button icon={<FolderAddOutlined />}>新建文件夹</Button>
          <Button icon={<CloudDownloadOutlined />}>离线下载</Button>
          <Button icon={<SettingOutlined />}>我的设备</Button>
        </div>
        <div className="right-search">
          <Input
            placeholder="搜索您的文件"
            prefix={<SearchOutlined />}
            className="search-input"
          />
          <div className="view-switch">
            <BarsOutlined className="active" />
            <AppstoreOutlined />
          </div>
        </div>
      </div>
      <div className="table-header">
        <div className="left">全部文件</div>
        <div className="right">已加载全部，共1个</div>
      </div>
      <div className="table-container">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          showHeader={true}
        />
      </div>
    </Content>
  );
}

export default ContentMain;
