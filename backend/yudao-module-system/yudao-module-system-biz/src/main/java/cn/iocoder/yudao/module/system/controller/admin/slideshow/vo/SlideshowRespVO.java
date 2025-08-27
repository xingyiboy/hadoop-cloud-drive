package cn.iocoder.yudao.module.system.controller.admin.slideshow.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;
import com.alibaba.excel.annotation.*;

@Schema(description = "管理后台 - 轮播图 Response VO")
@Data
@ExcelIgnoreUnannotated
public class SlideshowRespVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "29124")
    @ExcelProperty("用户ID")
    private Long id;

    @Schema(description = "创建时间", requiredMode = Schema.RequiredMode.REQUIRED)
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;

    @Schema(description = "图片")
    @ExcelProperty("图片")
    private String picture;

    @Schema(description = "跳转链接", example = "https://www.iocoder.cn")
    @ExcelProperty("跳转链接")
    private String url;

}