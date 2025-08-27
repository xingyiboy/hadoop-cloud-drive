import CryptoJS from "crypto-js";

// 加密密钥，建议使用环境变量存储
const SECRET_KEY = "xingyi-hadoop-123";

// 加密数据
export const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

// 解密数据
export const decrypt = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
