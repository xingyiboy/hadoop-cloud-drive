export const isShareLink = (url: string): string | null => {
  // 检查是否是完整的URL
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/");
    if (pathSegments.includes("share") && pathSegments.length > 2) {
      return pathSegments[pathSegments.indexOf("share") + 1];
    }
  } catch (e) {
    // 如果不是完整的URL，检查路径格式
    const pathSegments = url.split("/");
    if (pathSegments.includes("share") && pathSegments.length > 2) {
      return pathSegments[pathSegments.indexOf("share") + 1];
    }
  }
  return null;
};

export const extractShareKey = (path: string): string | null => {
  const segments = path.split("/");
  const shareIndex = segments.indexOf("share");
  if (shareIndex !== -1 && segments.length > shareIndex + 1) {
    return segments[shareIndex + 1];
  }
  return null;
};
