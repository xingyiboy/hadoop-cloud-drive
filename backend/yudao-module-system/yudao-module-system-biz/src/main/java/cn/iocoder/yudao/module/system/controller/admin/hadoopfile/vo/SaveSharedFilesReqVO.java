package cn.iocoder.yudao.module.system.controller.admin.hadoopfile.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "管理后台 - 保存分享文件请求 VO")
@Data
public class SaveSharedFilesReqVO {

    @Schema(description = "分享密钥", required = true, example = "abc123")
    @NotEmpty(message = "分享密钥不能为空")
    private String shareKey;

    @Schema(description = "文件ID列表", required = true)
    @NotEmpty(message = "文件ID列表不能为空")
    private List<String> fileIds;

    @Schema(description = "目标路径", required = true, example = "/我的文件夹")
    @NotEmpty(message = "目标路径不能为空")
    private String targetPath;

} 