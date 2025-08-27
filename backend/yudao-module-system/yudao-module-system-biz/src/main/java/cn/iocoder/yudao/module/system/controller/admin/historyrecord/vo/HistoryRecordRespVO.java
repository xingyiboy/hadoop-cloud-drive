package cn.iocoder.yudao.module.system.controller.admin.historyrecord.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;
import com.alibaba.excel.annotation.*;

@Schema(description = "管理后台 - 历史记录 Response VO")
@Data
@ExcelIgnoreUnannotated
public class HistoryRecordRespVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "26657")
    @ExcelProperty("用户ID")
    private Long id;

    @Schema(description = "创建时间", requiredMode = Schema.RequiredMode.REQUIRED)
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;

    @Schema(description = "跳转编号", example = "31141")
    @ExcelProperty("跳转编号")
    private Long historyId;

    @Schema(description = "页面路径", example = "https://www.iocoder.cn")
    @ExcelProperty("页面路径")
    private String pageUrl;

    @Schema(description = "标题")
    @ExcelProperty("标题")
    private String title;

    @Schema(description = "定位名")
    @ExcelProperty("定位名")
    private String location;

    @Schema(description = "用户编号", example = "3406")
    @ExcelProperty("用户编号")
    private Long userId;

    @Schema(description = "首页图片")
    @ExcelProperty("首页图片")
    private String picture;

}