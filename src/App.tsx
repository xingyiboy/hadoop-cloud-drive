/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-04-29 10:19:41
 * @FilePath: \CloudDiskWeb\src\App.tsx
 */
import React, { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import routes from "./routes";

// 路由组件
const RouterElement: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Suspense fallback={<div>加载中...</div>}>
        <RouterElement />
      </Suspense>
    </ConfigProvider>
  );
};

export default App;
