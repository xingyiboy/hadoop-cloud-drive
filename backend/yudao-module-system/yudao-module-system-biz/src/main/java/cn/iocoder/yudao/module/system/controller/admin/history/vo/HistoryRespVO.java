package cn.iocoder.yudao.module.system.controller.admin.history.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;
import com.alibaba.excel.annotation.*;
import cn.iocoder.yudao.framework.excel.core.annotations.DictFormat;
import cn.iocoder.yudao.framework.excel.core.convert.DictConvert;

@Schema(description = "管理后台 - 历史 Response VO")
@Data
@ExcelIgnoreUnannotated
public class HistoryRespVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "15912")
    @ExcelProperty("用户ID")
    private Long id;

    @Schema(description = "创建时间", requiredMode = Schema.RequiredMode.REQUIRED)
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;

    @Schema(description = "内容")
    @ExcelProperty("内容")
    private String content;

    @Schema(description = "地区")
    @ExcelProperty("地区")
    private String area;

    @Schema(description = "视频还是富文本")
    @ExcelProperty(value = "视频还是富文本", converter = DictConvert.class)
    @DictFormat("is_video") // TODO 代码优化：建议设置到对应的 DictTypeConstants 枚举类中
    private Integer isVideo;

    @Schema(description = "视频路径", example = "https://www.iocoder.cn")
    @ExcelProperty("视频路径")
    private String vidioUrl;

    @Schema(description = "标题")
    @ExcelProperty("标题")
    private String title;

}