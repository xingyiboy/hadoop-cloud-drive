export enum FileType {
  DIRECTORY = 6,
  IMAGE = 0,
  AUDIO = 1,
  VIDEO = 2,
  DOCUMENT = 3,
  PLANT = 4,
  OTHER = 5,
  RECYCLE = 7,
  SHARE = 8,
}

export const FileTypeMap: { [key in FileType]: string } = {
  [FileType.DIRECTORY]: "文件夹",
  [FileType.IMAGE]: "图片",
  [FileType.AUDIO]: "音频",
  [FileType.VIDEO]: "视频",
  [FileType.DOCUMENT]: "文档",
  [FileType.PLANT]: "种子",
  [FileType.OTHER]: "其他",
  [FileType.RECYCLE]: "回收站",
  [FileType.SHARE]: "我的分享",
};

// 文件扩展名映射到文件类型
export const getFileTypeByExt = (fileName: string): FileType => {
  const ext = fileName.toLowerCase().split(".").pop() || "";

  const imageExts = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const audioExts = ["mp3", "wav", "ogg", "flac", "aac"];
  const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];
  const documentExts = [
    "doc",
    "docx",
    "pdf",
    "txt",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
  ];
  const plantExts = ["torrent"];

  if (imageExts.includes(ext)) return FileType.IMAGE;
  if (audioExts.includes(ext)) return FileType.AUDIO;
  if (videoExts.includes(ext)) return FileType.VIDEO;
  if (documentExts.includes(ext)) return FileType.DOCUMENT;
  if (plantExts.includes(ext)) return FileType.PLANT;

  return FileType.OTHER;
};
