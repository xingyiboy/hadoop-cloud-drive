package cn.iocoder.yudao.module.system.controller.admin.news.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;

@Schema(description = "管理后台 - 新闻资讯新增/修改 Request VO")
@Data
public class NewsSaveReqVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "31228")
    private Long id;

    @Schema(description = "首页图片")
    private String picture;

    @Schema(description = "首页标题")
    private String title;

    @Schema(description = "阅读量")
    private Integer view;

    @Schema(description = "内容")
    private String content;

}
