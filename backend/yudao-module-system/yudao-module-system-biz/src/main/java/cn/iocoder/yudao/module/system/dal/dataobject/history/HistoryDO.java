package cn.iocoder.yudao.module.system.dal.dataobject.history;

import lombok.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.*;
import cn.iocoder.yudao.framework.mybatis.core.dataobject.BaseDO;

/**
 * 历史 DO
 *
 * @author 管理员
 */
@TableName("system_history")
@KeySequence("system_history_seq") // 用于 Oracle、PostgreSQL、Kingbase、DB2、H2 数据库的主键自增。如果是 MySQL 等数据库，可不写。
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryDO extends BaseDO {

    /**
     * 用户ID
     */
    @TableId
    private Long id;
    /**
     * 内容
     */
    private String content;
    /**
     * 地区
     */
    private String area;
    /**
     * 视频还是富文本
     *
     * 枚举 {@link TODO is_video 对应的类}
     */
    private Integer isVideo;
    /**
     * 视频路径
     */
    private String vidioUrl;
    /**
     * 标题
     */
    private String title;

}