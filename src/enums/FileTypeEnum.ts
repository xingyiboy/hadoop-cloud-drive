export enum FileType {
  IMAGE = 0,
  AUDIO = 1,
  VIDEO = 2,
  DOCUMENT = 3,
  PLANT = 4,
  OTHER = 5,
  DIRECTORY = 6,
}

export const FileTypeMap = {
  [FileType.IMAGE]: "图片",
  [FileType.AUDIO]: "音频",
  [FileType.VIDEO]: "视频",
  [FileType.DOCUMENT]: "文档",
  [FileType.PLANT]: "种子",
  [FileType.OTHER]: "其他",
  [FileType.DIRECTORY]: "目录",
};

// 文件扩展名映射到文件类型
export const getFileTypeByExt = (fileName: string): FileType => {
  const ext = fileName.toLowerCase().split(".").pop() || "";

  // 图片文件
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
    return FileType.IMAGE;
  }

  // 音频文件
  if (["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)) {
    return FileType.AUDIO;
  }

  // 视频文件
  if (["mp4", "avi", "mov", "wmv", "flv", "mkv"].includes(ext)) {
    return FileType.VIDEO;
  }

  // 文档文件
  if (
    ["doc", "docx", "pdf", "txt", "xls", "xlsx", "ppt", "pptx"].includes(ext)
  ) {
    return FileType.DOCUMENT;
  }

  // 种子文件
  if (["torrent"].includes(ext)) {
    return FileType.PLANT;
  }

  return FileType.OTHER;
};
