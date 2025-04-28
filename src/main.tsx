import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { store } from './store'
import { Provider } from 'react-redux'

import App from './App'

// 样式文件
import './styles/index.scss'
import 'antd/dist/antd.css'

/**
 * React.StrictMode 严格模式检查，不影响构建
 * HashRouter 路由模式
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </HashRouter>
  </React.StrictMode>
)
