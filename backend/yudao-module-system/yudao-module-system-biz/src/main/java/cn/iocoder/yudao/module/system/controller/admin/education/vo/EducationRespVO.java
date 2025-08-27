package cn.iocoder.yudao.module.system.controller.admin.education.vo;

import com.fhs.core.trans.anno.Trans;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;
import com.alibaba.excel.annotation.*;

@Schema(description = "管理后台 - 教育 Response VO")
@Data
@ExcelIgnoreUnannotated
public class EducationRespVO {

    private String creator;
    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "9764")
    @ExcelProperty("用户ID")
    private Long id;

    @Schema(description = "创建时间", requiredMode = Schema.RequiredMode.REQUIRED)
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;

    @Schema(description = "视频")
    @ExcelProperty("视频")
    private String vidio;

    @Schema(description = "视频标题")
    @ExcelProperty("视频标题")
    private String title;

    @Schema(description = "用户名")
    @ExcelProperty("用户名")
    private String userName;

    @Schema(description = "首页图片")
    @ExcelProperty("首页图片")
    private String picture;

    @Schema(description = "观看量")
    @ExcelProperty("观看量")
    private Integer views;

    @Schema(description = "评论量")
    @ExcelProperty("评论量")
    private Integer comment;

    @Schema(description = "点赞量")
    @ExcelProperty("点赞量")
    private Integer likes;


}
