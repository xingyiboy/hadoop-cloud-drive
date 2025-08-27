package cn.iocoder.yudao.module.system.controller.admin.historyrecord.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;

@Schema(description = "管理后台 - 历史记录新增/修改 Request VO")
@Data
public class HistoryRecordSaveReqVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "26657")
    private Long id;

    @Schema(description = "跳转编号", example = "31141")
    private Long historyId;

    @Schema(description = "页面路径", example = "https://www.iocoder.cn")
    private String pageUrl;

    @Schema(description = "标题")
    private String title;

    @Schema(description = "定位名")
    private String location;

    @Schema(description = "用户编号", example = "3406")
    private Long userId;

    @Schema(description = "首页图片")
    private String picture;

}
