package cn.iocoder.yudao.module.system.controller.admin.slideshow.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;

@Schema(description = "管理后台 - 轮播图新增/修改 Request VO")
@Data
public class SlideshowSaveReqVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "29124")
    private Long id;

    @Schema(description = "图片")
    private String picture;

    @Schema(description = "跳转链接", example = "https://www.iocoder.cn")
    private String url;

}
