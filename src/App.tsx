/*
 * @Date: 2025-04-28 17:45:53
 * @LastEditors: xingyi && 2416820386@qq.com
 * @LastEditTime: 2025-04-29 10:19:41
 * @FilePath: \CloudDiskWeb\src\App.tsx
 */
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MyRoute from "@/routes/index";

import { getToken } from "@/utils/setToken";

function App() {
  const location = useLocation(); // 返回当前路由对象
  const navigate = useNavigate(); // 允许使用编程式导航

  // 未登录或登录信息丢失时重新登录
  useEffect(() => {
    if (getToken()) {
    } else if (location.pathname === "/register") {
    } else if (location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [location]);

  return (
    <div className="App">
      {/* 动态导入的组件要用 Suspense 包裹 */}
      <React.Suspense>
        <MyRoute></MyRoute>
      </React.Suspense>
    </div>
  );
}

export default App;
