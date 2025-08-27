import React from "react";
import { FileType } from "@/enums/FileTypeEnum";
import { FILE_ICONS } from "@/constants/fileConstants";

interface FileIconProps {
  type: FileType;
  className?: string;
}

const FileIcon: React.FC<FileIconProps> = ({ type, className = "" }) => {
  const getFileIcon = (fileType: FileType): string => {
    switch (fileType) {
      case FileType.DIRECTORY:
        return FILE_ICONS.DIRECTORY;
      case FileType.IMAGE:
        return FILE_ICONS.IMAGE;
      case FileType.AUDIO:
        return FILE_ICONS.AUDIO;
      case FileType.VIDEO:
        return FILE_ICONS.VIDEO;
      case FileType.DOCUMENT:
        return FILE_ICONS.DOCUMENT;
      case FileType.PLANT:
        return FILE_ICONS.PLANT;
      default:
        return FILE_ICONS.FILE;
    }
  };

  const getIconClassName = (fileType: FileType): string => {
    const baseClass = className;
    switch (fileType) {
      case FileType.DIRECTORY:
        return `${baseClass} folder-icon`;
      case FileType.IMAGE:
        return `${baseClass} image-icon`;
      case FileType.AUDIO:
        return `${baseClass} audio-icon`;
      case FileType.VIDEO:
        return `${baseClass} video-icon`;
      case FileType.DOCUMENT:
        return `${baseClass} document-icon`;
      case FileType.PLANT:
        return `${baseClass} plant-icon`;
      default:
        return `${baseClass} file-icon`;
    }
  };

  return (
    <span className={getIconClassName(type)}>
      {getFileIcon(type)}
    </span>
  );
};

export default FileIcon;
