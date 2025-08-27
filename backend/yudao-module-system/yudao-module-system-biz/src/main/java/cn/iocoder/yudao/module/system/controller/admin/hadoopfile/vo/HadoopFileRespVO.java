package cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;
import com.alibaba.excel.annotation.*;
import cn.iocoder.yudao.framework.excel.core.annotations.DictFormat;
import cn.iocoder.yudao.framework.excel.core.convert.DictConvert;
import cn.iocoder.yudao.module.system.enums.DictTypeConstants;

@Schema(description = "管理后台 - hadoop文件 Response VO")
@Data
@ExcelIgnoreUnannotated
public class HadoopFileRespVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1614")
    @ExcelProperty("用户ID")
    private Long id;

    @Schema(description = "创建时间", requiredMode = Schema.RequiredMode.REQUIRED)
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;

    @Schema(description = "文件类型", example = "2")
    @ExcelProperty(value = "文件类型", converter = DictConvert.class)
    @DictFormat(DictTypeConstants.FILE_TYPE)
    private Integer type;

    @Schema(description = "文件名", example = "赵六")
    @ExcelProperty("文件名")
    private String name;

    @Schema(description = "父级目录")
    @ExcelProperty("父级目录")
    private String catalogue;

    @Schema(description = "大小(MB)")
    @ExcelProperty("大小(MB)")
    private String size;

}