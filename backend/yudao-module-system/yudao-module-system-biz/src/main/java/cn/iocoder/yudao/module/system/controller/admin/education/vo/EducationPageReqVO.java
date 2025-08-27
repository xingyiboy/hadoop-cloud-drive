package cn.iocoder.yudao.module.system.controller.admin.education.vo;

import lombok.*;
import java.util.*;
import io.swagger.v3.oas.annotations.media.Schema;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

import static cn.iocoder.yudao.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - 教育分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class EducationPageReqVO extends PageParam {

    @Schema(description = "创建时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] createTime;

    @Schema(description = "视频")
    private String vidio;

    @Schema(description = "视频标题")
    private String title;

    @Schema(description = "首页图片")
    private String picture;

    @Schema(description = "观看量")
    private Integer views;

    @Schema(description = "评论量")
    private Integer comment;

    @Schema(description = "点赞量")
    private Integer likes;

}