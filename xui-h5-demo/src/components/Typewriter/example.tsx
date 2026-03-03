import React, { useState } from 'react';
import Typewriter from './index';
import AdvancedTypewriter from './AdvancedTypewriter';

const TypewriterExample: React.FC = () => {
    const [currentExample, setCurrentExample] = useState(0);

    const examples = [
        {
            title: '基础打字效果',
            content: '这是一个基础的打字机效果示例。',
            component: Typewriter
        },
        {
            title: 'Markdown 支持',
            content: `# 标题 1
## 标题 2

这是一个 **粗体文本** 和 *斜体文本* 的示例。

- 列表项 1
- 列表项 2
- 列表项 3

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

> 这是一个引用块示例。`,
            component: Typewriter
        },
        {
            title: '高级打字效果（带标点符号暂停）',
            content: '这是一个高级打字机效果示例。它会在标点符号处暂停，让打字效果更加自然。这个功能可以让文本的阅读体验更加流畅。',
            component: AdvancedTypewriter
        },
        {
            title: '代码高亮示例',
            content: `# 代码高亮示例

\`\`\`javascript
// JavaScript 代码示例
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
\`\`\`

\`\`\`python
# Python 代码示例
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
\`\`\`

\`\`\`css
/* CSS 样式示例 */
.typewriter-container {
    font-family: 'Courier New', monospace;
    line-height: 1.5;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}
\`\`\``,
            component: Typewriter
        }
    ];

    const handleComplete = () => {
        console.log('打字完成！');
    };

    const CurrentComponent = examples[currentExample].component;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>打字机效果示例</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => setCurrentExample(0)}
                    style={{ 
                        marginRight: '10px',
                        padding: '8px 16px',
                        backgroundColor: currentExample === 0 ? '#007bff' : '#f8f9fa',
                        color: currentExample === 0 ? 'white' : 'black',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    基础示例
                </button>
                <button 
                    onClick={() => setCurrentExample(1)}
                    style={{ 
                        marginRight: '10px',
                        padding: '8px 16px',
                        backgroundColor: currentExample === 1 ? '#007bff' : '#f8f9fa',
                        color: currentExample === 1 ? 'white' : 'black',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Markdown
                </button>
                <button 
                    onClick={() => setCurrentExample(2)}
                    style={{ 
                        marginRight: '10px',
                        padding: '8px 16px',
                        backgroundColor: currentExample === 2 ? '#007bff' : '#f8f9fa',
                        color: currentExample === 2 ? 'white' : 'black',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    高级效果
                </button>
                <button 
                    onClick={() => setCurrentExample(3)}
                    style={{ 
                        padding: '8px 16px',
                        backgroundColor: currentExample === 3 ? '#007bff' : '#f8f9fa',
                        color: currentExample === 3 ? 'white' : 'black',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    代码高亮
                </button>
            </div>

            <div style={{ 
                border: '1px solid #dee2e6', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                minHeight: '300px'
            }}>
                <h3>{examples[currentExample].title}</h3>
                <CurrentComponent
                    message={examples[currentExample].content}
                    speed={50}
                    onComplete={handleComplete}
                    className="example-typewriter"
                />
            </div>

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p><strong>功能特点：</strong></p>
                <ul>
                    <li>支持 Markdown 语法渲染</li>
                    <li>代码高亮显示</li>
                    <li>可配置打字速度</li>
                    <li>打字完成回调</li>
                    <li>闪烁光标效果</li>
                    <li>高级版本支持标点符号暂停</li>
                </ul>
            </div>
        </div>
    );
};

export default TypewriterExample; 