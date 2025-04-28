import { useNavigate } from 'react-router-dom'

import { Menu, Dropdown, Space } from 'antd'
import { DownOutlined } from '@ant-design/icons'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/modules/user'

function Header() {
  const navigate = useNavigate() //允许使用编程式导航
  const dispatch = useAppDispatch()
  const { userName } = useAppSelector(state => state.user)

  function logOut() {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const menu = (
    <Menu
      onClick={logOut}
      items={[
        {
          label: '退出',
          key: '0'
        }
      ]}
    />
  )
  return (
    <div className="header">
      <div className="logo">logo</div>
      <Dropdown overlay={menu} trigger={['click']} className="head-dropdown">
        <a onClick={e => e.preventDefault()}>
          <Space>
            {userName}
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
    </div>
  )
}

export default Header
