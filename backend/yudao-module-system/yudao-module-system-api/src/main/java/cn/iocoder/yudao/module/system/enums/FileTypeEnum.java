package cn.iocoder.yudao.module.system.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 文件类型枚举
 */
@Getter
@AllArgsConstructor
public enum FileTypeEnum {

    IMAGE(0, "图片"),
    AUDIO(1, "音频"),
    VIDEO(2, "视频"),
    DOCUMENT(3, "文档"),
    PLANT(4, "种子"),
    OTHER(5, "其他"),
    DIRECTORY(6, "目录"),
    RECYCLE(7, "回收站"),
    SHARE(8, "分享");

    /**
     * 类型
     */
    private final Integer type;
    /**
     * 描述
     */
    private final String description;

} 