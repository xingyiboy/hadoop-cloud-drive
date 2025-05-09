import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/modules/user'
import type { MenuProps } from 'antd';
import { Layout, Menu} from 'antd';

import '../style/header-main.scss'

const { Header } = Layout;

const items1: MenuProps['items'] = ['1', '2', '3'].map((key) => ({
  key,
  label: `nav ${key}`,
}));  

function HeaderMain() {
  const navigate = useNavigate() //允许使用编程式导航
  const dispatch = useAppDispatch()
  const { userName } = useAppSelector(state => state.user)

  function logOut() {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <Header className='header' style={{ display: 'flex', alignItems: 'center' }}>
      <div className='logo'>QST</div>
      <div className='logo-title'>云端网盘</div>
      <Menu
        theme="light"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        items={items1}
        style={{ flex: 1, minWidth: 0 }}
      />
    </Header>
  )
}

export default HeaderMain
