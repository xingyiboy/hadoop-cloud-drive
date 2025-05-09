

import { Layout } from 'antd';
const {  Content } = Layout;
function ContentMain(){
  return (
    <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: '#fff',
            borderRadius: 1,
          }}
        >
          Content
        </Content>
  )
}

export default ContentMain