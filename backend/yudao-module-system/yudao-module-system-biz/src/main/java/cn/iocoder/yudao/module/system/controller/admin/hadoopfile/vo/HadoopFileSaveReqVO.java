package cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Schema(description = "管理后台 - hadoop文件创建 Request VO")
@Data
public class HadoopFileSaveReqVO {

    @Schema(description = "文件类型", example = "2")
    private Integer type;

    @Schema(description = "文件名", example = "test.jpg")
    private String name;

    @Schema(description = "父级目录", example = "/test")
    private String catalogue;

    @Schema(description = "大小(MB)")
    private String size;

    @Schema(description = "上传的文件")
    private MultipartFile file;

}
