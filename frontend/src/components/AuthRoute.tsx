import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "@/utils/setToken";

interface Props {
  children: JSX.Element;
}

function AuthRoute({ children }: Props) {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    // 将用户重定向到登录页面，但保存他们要访问的页面路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default AuthRoute;
