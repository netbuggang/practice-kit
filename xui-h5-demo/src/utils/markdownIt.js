import MarkdownIt from "markdown-it";
import hljs from "highlight.js/lib/core";
import "highlight.js/styles/atom-one-dark.css";

// 导入你需要的语言包
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml"; // 对于 HTML 和 XML
// 添加更多语言...

// 注册语言
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);

// 初始化 markdown-it 实例并配置它使用 highlight.js 进行代码高亮
const md = new MarkdownIt({
    html: true,
    breaks: true,
    tables: true, // 启用 GFM 表格支持
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value
                    }</code></pre>`;
            } catch (__) { }
        }

        return `<pre class="hljs"><code>${new MarkdownIt().utils.escapeHtml(
            str
        )}</code></pre>`;
    },
});

export {
    md
};
