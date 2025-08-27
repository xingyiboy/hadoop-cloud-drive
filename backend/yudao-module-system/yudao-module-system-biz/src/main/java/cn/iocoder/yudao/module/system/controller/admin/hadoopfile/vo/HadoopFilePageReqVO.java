package cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo;

import lombok.*;
import java.util.*;
import io.swagger.v3.oas.annotations.media.Schema;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

import static cn.iocoder.yudao.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - hadoop文件分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class HadoopFilePageReqVO extends PageParam {

    @Schema(description = "创建时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] createTime;

    @Schema(description = "文件类型", example = "2")
    private Integer type;

    @Schema(description = "文件名", example = "赵六")
    private String name;

    @Schema(description = "排除的文件名前缀列表")
    private List<String> excludeNames;

    @Schema(description = "排除的文件名前缀")
    private String excludeName;

    @Schema(description = "父级目录")
    private String catalogue;

    @Schema(description = "大小(MB)")
    private String size;

    @Schema(description = "排序字段")
    private String sortField;

    @Schema(description = "排序顺序：ascend - 升序，descend - 降序")
    private String sortOrder;

    @Schema(description = "是否排除已分享的文件")
    private Boolean excludeShared;
}
