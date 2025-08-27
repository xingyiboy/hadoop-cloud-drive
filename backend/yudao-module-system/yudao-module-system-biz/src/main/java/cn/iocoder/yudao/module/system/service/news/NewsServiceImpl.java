package cn.iocoder.yudao.module.system.service.news;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import cn.iocoder.yudao.module.system.controller.admin.news.vo.*;
import cn.iocoder.yudao.module.system.dal.dataobject.news.NewsDO;
import cn.iocoder.yudao.framework.common.pojo.PageResult;
import cn.iocoder.yudao.framework.common.pojo.PageParam;
import cn.iocoder.yudao.framework.common.util.object.BeanUtils;

import cn.iocoder.yudao.module.system.dal.mysql.news.NewsMapper;

import javax.annotation.Resource;

import static cn.iocoder.yudao.framework.common.exception.util.ServiceExceptionUtil.exception;
import static cn.iocoder.yudao.module.system.enums.ErrorCodeConstants.*;

/**
 * 新闻资讯 Service 实现类
 *
 * @author 芋道源码
 */
@Service
@Validated
public class NewsServiceImpl implements NewsService {

    @Resource
    private NewsMapper newsMapper;

    @Override
    public Long createNews(NewsSaveReqVO createReqVO) {
        // 插入
        NewsDO news = BeanUtils.toBean(createReqVO, NewsDO.class);
        newsMapper.insert(news);
        // 返回
        return news.getId();
    }

    @Override
    public void updateNews(NewsSaveReqVO updateReqVO) {
        // 校验存在
        validateNewsExists(updateReqVO.getId());
        // 更新
        NewsDO updateObj = BeanUtils.toBean(updateReqVO, NewsDO.class);
        newsMapper.updateById(updateObj);
    }

    @Override
    public void deleteNews(Long id) {
        // 校验存在
        validateNewsExists(id);
        // 删除
        newsMapper.deleteById(id);
    }

    private void validateNewsExists(Long id) {
        if (newsMapper.selectById(id) == null) {
            throw exception(NEWS_NOT_EXISTS);
        }
    }

    @Override
    public NewsDO getNews(Long id) {
        NewsDO newsDO = newsMapper.selectById(id);
        newsDO.setView(newsDO.getView() + 1);
        newsMapper.updateById(newsDO);
        return newsDO;
    }

    @Override
    public PageResult<NewsDO> getNewsPage(NewsPageReqVO pageReqVO) {
        return newsMapper.selectPage(pageReqVO);
    }

}
