const keyName = 'nh-admin'

// 获取 token 值
export function getToken() {
  return sessionStorage.getItem(keyName)
}

// 设置 token 值
export function setToken(value:string) {
  return sessionStorage.setItem(keyName, value)
}

// 删除 token
export function removeToken() {
  return sessionStorage.removeItem(keyName)
}
