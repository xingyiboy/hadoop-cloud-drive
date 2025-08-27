package cn.iocoder.yudao.module.system.dal.dataobject.educationcomment;

import lombok.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.*;
import cn.iocoder.yudao.framework.mybatis.core.dataobject.BaseDO;

/**
 * 教育评论 DO
 *
 * @author 芋道源码
 */
@TableName("system_education_comment")
@KeySequence("system_education_comment_seq") // 用于 Oracle、PostgreSQL、Kingbase、DB2、H2 数据库的主键自增。如果是 MySQL 等数据库，可不写。
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationCommentDO extends BaseDO {

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
     * 用户编号
     */
    private Long userId;
    /**
     * 评论内容
     */
    private String content;

}