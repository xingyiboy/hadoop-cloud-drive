package cn.iocoder.yudao.module.system.controller.admin.historyrecord.vo;

import lombok.*;
import java.util.*;
import io.swagger.v3.oas.annotations.media.Schema;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

import static cn.iocoder.yudao.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - 历史记录分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class HistoryRecordPageReqVO extends PageParam {

    @Schema(description = "创建时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] createTime;

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