package cn.iocoder.yudao.module.system.controller.admin.history.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;

@Schema(description = "管理后台 - 历史新增/修改 Request VO")
@Data
public class HistorySaveReqVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "15912")
    private Long id;

    @Schema(description = "内容")
    private String content;

    @Schema(description = "地区")
    private String area;

    @Schema(description = "视频还是富文本")
    private Integer isVideo;

    @Schema(description = "视频路径", example = "https://www.iocoder.cn")
    private String vidioUrl;

    @Schema(description = "标题")
    private String title;

}
