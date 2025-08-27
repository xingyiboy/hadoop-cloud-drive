import { Breadcrumb, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect } from "react";

interface BreadcrumbNavProps {
  onPathChange: (path: string) => void;
  currentPath: string;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  onPathChange,
  currentPath,
}) => {
  useEffect(() => {
    localStorage.setItem("currentPath", currentPath);
  }, [currentPath]);

  // 处理返回上一级
  const handleBack = () => {
    if (currentPath === "/") return;
    const pathParts = currentPath.split("/").filter(Boolean);
    pathParts.pop(); // 移除最后一个目录
    const newPath = pathParts.length ? `/${pathParts.join("/")}` : "/";
    onPathChange(newPath);
  };

  // 处理面包屑项点击
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // 点击根目录
      onPathChange("/");
      return;
    }
    const pathParts = currentPath.split("/").filter(Boolean);
    const newPathParts = pathParts.slice(0, index + 1);
    const newPath = `/${newPathParts.join("/")}`;
    onPathChange(newPath);
  };

  // 生成面包屑项
  const generateBreadcrumbItems = () => {
    const pathParts = currentPath.split("/").filter(Boolean);
    const items = [];

    // 添加根目录
    items.push({
      title: "根目录",
      path: "/",
    });

    // 添加其他目录层级
    let accumulatedPath = "";
    pathParts.forEach((part) => {
      accumulatedPath += `/${part}`;
      items.push({
        title: part,
        path: accumulatedPath,
      });
    });

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "30px 10px 0px 24px",
      }}
    >
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        disabled={currentPath === "/"}
        style={{ marginRight: "16px" }}
      />
      <Breadcrumb>
        <Breadcrumb.Item
          onClick={() => handleBreadcrumbClick(-1)}
          className="breadcrumb-item"
        >
          <span style={{ cursor: "pointer" }}>根目录</span>
        </Breadcrumb.Item>
        {breadcrumbItems.slice(1).map((item, index) => (
          <Breadcrumb.Item
            key={index}
            onClick={() => handleBreadcrumbClick(index)}
            className="breadcrumb-item"
          >
            <span style={{ cursor: "pointer" }}>{item.title}</span>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbNav;
