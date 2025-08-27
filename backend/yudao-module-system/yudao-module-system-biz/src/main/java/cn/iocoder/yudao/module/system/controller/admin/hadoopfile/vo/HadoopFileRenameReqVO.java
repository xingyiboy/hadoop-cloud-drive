package cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Schema(description = "管理后台 - hadoop文件重命名 Request VO")
@Data
public class HadoopFileRenameReqVO {

    @Schema(description = "文件编号", requiredMode = Schema.RequiredMode.REQUIRED, example = "1024")
    @NotNull(message = "文件编号不能为空")
    private Long id;

    @Schema(description = "新文件名", requiredMode = Schema.RequiredMode.REQUIRED, example = "新文件名.txt")
    @NotNull(message = "新文件名不能为空")
    private String newName;
} 