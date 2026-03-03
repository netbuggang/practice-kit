import React, { useState } from 'react';
import ShowMessage from './index';
import { AdvancedTypewriter } from '../Typewriter';

const ShowMessageExample: React.FC = () => {
    const [currentExample, setCurrentExample] = useState(0);

    const examples = [
        {
            title: '基础 ShowMessage 组件',
            content: '# 欢迎使用 ShowMessage 组件\n\n这是一个基础的 Markdown 文本示例。',
            useTypewriter: false
        },
        {
            title: '带打字机效果的 ShowMessage',
            content: `# 打字机效果示例

这是一个支持 **Markdown** 语法的打字机效果。

## 功能特点

- ✅ 支持 Markdown 语法
- ✅ 代码高亮显示
- ✅ 可配置打字速度
- ✅ 打字完成回调

\`\`\`javascript
// 代码示例
function hello() {
    console.log("Hello, World!");
}
\`\`\``,
            useTypewriter: true,
            speed: 50
        },
        {
            title: '高级打字机效果',
            content: `# 高级打字机效果

这是一个高级打字机效果示例。它会在标点符号处暂停，让打字效果更加自然。

这个功能可以让文本的阅读体验更加流畅，就像真人在打字一样。

> 这是一个引用块示例。

- 列表项 1
- 列表项 2
- 列表项 3`,
            useTypewriter: true,
            speed: 30,
            component: AdvancedTypewriter
        }
    ];

    const handleComplete = () => {
        console.log('打字完成！');
    };

    const currentExampleData = examples[currentExample];

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>ShowMessage 组件示例</h1>
            
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
                    打字机效果
                </button>
                <button 
                    onClick={() => setCurrentExample(2)}
                    style={{ 
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
            </div>

            <div style={{ 
                border: '1px solid #dee2e6', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                minHeight: '400px'
            }}>
                <h3>{currentExampleData.title}</h3>
                
                {currentExampleData.component ? (
                    <currentExampleData.component
                        message={currentExampleData.content}
                        speed={currentExampleData.speed || 50}
                        onComplete={handleComplete}
                        className="example-typewriter"
                    />
                ) : (
                    <ShowMessage
                        message={currentExampleData.content}
                        useTypewriter={currentExampleData.useTypewriter}
                        typewriterSpeed={currentExampleData.speed || 50}
                        onTypewriterComplete={handleComplete}
                    />
                )}
            </div>

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p><strong>使用说明：</strong></p>
                <ul>
                    <li><strong>基础模式：</strong>直接渲染 Markdown 文本</li>
                    <li><strong>打字机模式：</strong>启用打字机效果，逐字符显示</li>
                    <li><strong>高级模式：</strong>使用 AdvancedTypewriter 组件，支持标点符号暂停</li>
                </ul>
                
                <p><strong>Props 说明：</strong></p>
                <ul>
                    <li><code>message</code>: 要显示的文本内容</li>
                    <li><code>useTypewriter</code>: 是否启用打字机效果</li>
                    <li><code>typewriterSpeed</code>: 打字速度（毫秒）</li>
                    <li><code>onTypewriterComplete</code>: 打字完成回调函数</li>
                </ul>
            </div>
        </div>
    );
};

export default ShowMessageExample; 