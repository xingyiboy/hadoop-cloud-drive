package cn.iocoder.yudao.module.system.dal.dataobject.historyrecord;

import lombok.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.*;
import cn.iocoder.yudao.framework.mybatis.core.dataobject.BaseDO;

/**
 * 历史记录 DO
 *
 * @author 管理员
 */
@TableName("system_history_record")
@KeySequence("system_history_record_seq") // 用于 Oracle、PostgreSQL、Kingbase、DB2、H2 数据库的主键自增。如果是 MySQL 等数据库，可不写。
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryRecordDO extends BaseDO {

    /**
     * 用户ID
     */
    @TableId
    private Long id;
    /**
     * 跳转编号
     */
    private Long historyId;
    /**
     * 页面路径
     */
    private String pageUrl;
    /**
     * 标题
     */
    private String title;
    /**
     * 定位名
     */
    private String location;
    /**
     * 用户编号
     */
    private Long userId;
    /**
     * 首页图片
     */
    private String picture;

}