package cn.iocoder.yudao.module.system.controller.admin.education.vo;

import cn.iocoder.yudao.framework.excel.core.annotations.DictFormat;
import cn.iocoder.yudao.framework.excel.core.convert.DictConvert;
import cn.iocoder.yudao.module.system.dal.dataobject.user.AdminUserDO;
import com.alibaba.excel.annotation.ExcelIgnoreUnannotated;
import com.alibaba.excel.annotation.ExcelProperty;
import com.baomidou.mybatisplus.annotation.TableId;
import com.fhs.core.trans.anno.Trans;
import com.fhs.core.trans.constant.TransType;
import com.fhs.core.trans.vo.VO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 教育评论 Response VO")
@Data
@ExcelIgnoreUnannotated
public class EducationCommentVO implements VO {

    @Schema(description = "创建时间", requiredMode = Schema.RequiredMode.REQUIRED)
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;

    /**
     * 用户ID
     */
    @TableId
    private Long id;
    /**
     * 教育编号
     */
    private Long educationId;
    /**
     * 评论内容
     */
    private String content;

    @Schema(description = "用户编号", example = "29501")
    @Trans(type = TransType.SIMPLE, target = AdminUserDO.class, fields = "nickname,avatar", ref = "userName,avatar")
    @ExcelProperty("用户编号")
    private Long userId;

    @Schema(description = "用户名称", example = "userName")
    @ExcelProperty("用户名称")
    private String userName;

    @Schema(description = "用户头像", example = "avatar")
    @ExcelProperty("用户头像")
    private String avatar;


}
