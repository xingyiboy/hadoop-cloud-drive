package cn.iocoder.yudao.module.system.controller.admin.news.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;
import com.alibaba.excel.annotation.*;

@Schema(description = "管理后台 - 新闻资讯 Response VO")
@Data
@ExcelIgnoreUnannotated
public class NewsRespVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "31228")
    @ExcelProperty("用户ID")
    private Long id;

    @Schema(description = "创建时间", requiredMode = Schema.RequiredMode.REQUIRED)
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;

    @Schema(description = "首页图片")
    @ExcelProperty("首页图片")
    private String picture;

    @Schema(description = "首页标题")
    @ExcelProperty("首页标题")
    private String title;

    @Schema(description = "阅读量")
    @ExcelProperty("阅读量")
    private Integer view;

    @Schema(description = "内容")
    @ExcelProperty("内容")
    private String content;

}