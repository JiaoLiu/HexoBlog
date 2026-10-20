require('../includes/tasks/welcome');
require('../includes/tasks/check_deps');
require('../includes/tasks/check_config');
require('../includes/generators/categories')(hexo);
require('../includes/generators/category')(hexo);
require('../includes/generators/tags')(hexo);
require('../includes/generators/insight')(hexo);
require('../includes/filters/highlight')(hexo);
require('../includes/helpers/cdn')(hexo);
require('../includes/helpers/config')(hexo);
require('../includes/helpers/layout')(hexo);
require('../includes/helpers/override')(hexo);
require('../includes/helpers/page')(hexo);
require('../includes/helpers/site')(hexo);

// Debug helper
hexo.extend.helper.register('console', function () {
    console.log(arguments)
});

// 正文图片：多档 srcset 自适应 + 懒加载 + 点击查看大图
// 服务器只保留一份 1280 底图，640/400 档由 nginx image_filter 实时生成并缓存
hexo.extend.filter.register('after_post_render', function (data) {
    const IMG_RE = /<img([^>]*?)\ssrc="(\/gallary\/[^"]+)"([^>]*?)>/g;

    const enhance = (html) => html.replace(IMG_RE, function (match, pre, src, post) {
        // 已经是派生图的不再处理，避免重复包裹
        if (/^\/img\/w(400|640|1280)\//.test(src)) return match;
        if (!/\.(jpe?g|png)$/i.test(src)) return match;

        const name = src.slice('/gallary/'.length);
        const small = '/img/w640/' + name;

        const attrs = (pre + post)
            .replace(/\s(loading|decoding|srcset|sizes)="[^"]*"/g, '')
            .trim();

        return '<a class="img-lightbox" href="' + src + '" aria-label="查看大图">'
            + '<img src="' + src + '"'
            + ' srcset="' + small + ' 640w, ' + src + ' 1280w"'
            + ' sizes="(max-width: 1024px) 100vw, 780px"'
            + ' data-small="' + small + '"'
            + ' loading="lazy" decoding="async"'
            + (attrs ? ' ' + attrs : '')
            + '></a>';
    });

    if (data.content) {
        data.content = enhance(data.content);
    }
    if (data.excerpt) {
        data.excerpt = enhance(data.excerpt);
    }
    return data;
});