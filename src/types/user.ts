export interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  email: string;
  mobile: string;
  sex: number;
  avatar: string;
  loginIp: string;
  loginDate: number;
  createTime: number;
  roles: any[];
  dept: any | null;
  posts: any | null;
  socialUsers: any[];
  // 可以根据实际接口返回数据添加更多字段
}
