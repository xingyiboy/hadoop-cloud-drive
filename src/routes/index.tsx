import React from 'react'
import { useRoutes } from 'react-router-dom'

/**
 * React.lazy 懒加载
 * 使组件动态导入
 */
const Login = React.lazy(() => import('@/views/login/index'))
const Layout = React.lazy(() => import('@/layout/index'))

function MyRoute() {
  let element = useRoutes([
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/',
      element: <Layout />,
      children: []
    }
  ])

  return element
}

export default MyRoute
