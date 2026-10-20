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

// 正文图片：多档 srcset 自适应 + 懒加载 + 点击查看原图
// 正文最高只到 1280 档，原图仅通过灯箱按需加载，避免 Retina 屏拉取原图
hexo.extend.filter.register('after_post_render', function (data) {
    const IMG_RE = /<img([^>]*?)\ssrc="(\/gallary\/[^"]+)"([^>]*?)>/g;

    const enhance = (html) => html.replace(IMG_RE, function (match, pre, src, post) {
        // 缩略图、小图、原图档不处理，避免重复包裹
        if (/\/gallary\/(thumbs|s|l)\//.test(src)) return match;
        if (!/\.(jpe?g|png)$/i.test(src)) return match;

        const name = src.slice('/gallary/'.length);
        const small = '/gallary/s/' + name;
        const large = '/gallary/l/' + name;

        const attrs = (pre + post)
            .replace(/\s(loading|decoding|srcset|sizes)="[^"]*"/g, '')
            .trim();

        return '<a class="img-lightbox" href="' + large + '" aria-label="查看大图">'
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