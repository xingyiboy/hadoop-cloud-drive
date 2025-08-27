package cn.iocoder.yudao.module.system.controller.admin.education.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.*;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcollect.EducationCollectDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationcomment.EducationCommentDO;
import cn.iocoder.yudao.module.system.dal.dataobject.educationlike.EducationLikeDO;

@Schema(description = "管理后台 - 教育新增/修改 Request VO")
@Data
public class EducationSaveReqVO {

    @Schema(description = "用户ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "9764")
    private Long id;

    @Schema(description = "视频")
    private String vidio;

    @Schema(description = "视频标题")
    private String title;

    @Schema(description = "首页图片")
    private String picture;

    @Schema(description = "观看量")
    private Integer views;

    @Schema(description = "评论量")
    private Integer comment;

    @Schema(description = "点赞量")
    private Integer likes;

    @Schema(description = "教育收藏列表")
    private List<EducationCollectDO> educationCollects;

    @Schema(description = "教育评论列表")
    private List<EducationCommentDO> educationComments;

    @Schema(description = "教育点赞列表")
    private List<EducationLikeDO> educationLikes;

}
