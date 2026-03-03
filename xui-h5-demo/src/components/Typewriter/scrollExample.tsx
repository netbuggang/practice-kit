import React, { useState, useRef, useCallback } from 'react';
import Typewriter from './index';
import AdvancedTypewriter from './AdvancedTypewriter';

const ScrollTypewriterExample: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 滚动到底部的函数
    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, []);

    // 添加新消息
    const addMessage = (message: string) => {
        setMessages(prev => [...prev, message]);
        setCurrentMessage(message);
        setIsTyping(true);
    };

    // 打字完成回调
    const handleComplete = () => {
        setIsTyping(false);
        console.log('打字完成！');
    };

    const exampleMessages = [
        '# 欢迎使用打字机效果\n\n这是一个支持 **Markdown** 语法的打字机效果。',
        '## 功能特点\n\n- ✅ 支持 Markdown 语法\n- ✅ 代码高亮显示\n- ✅ 可配置打字速度\n- ✅ 打字完成回调\n- ✅ 自动滚动到底部',
        '```javascript\n// 代码示例\nfunction hello() {\n    console.log("Hello, World!");\n}\n```',
        '这是一个很长的消息，用来测试自动滚动功能。当内容超出容器高度时，会自动滚动到底部，确保用户始终能看到最新的内容。这个功能特别适合聊天界面或日志显示场景。',
        '> 这是一个引用块示例。\n\n当打字机效果运行时，页面会自动滚动到底部，确保用户始终能看到最新的内容。'
    ];

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh',
            padding: '20px'
        }}>
            <h1>打字机效果 + 自动滚动示例</h1>
            
            {/* 控制按钮 */}
            <div style={{ marginBottom: '20px' }}>
                {exampleMessages.map((msg, index) => (
                    <button
                        key={index}
                        onClick={() => addMessage(msg)}
                        disabled={isTyping}
                        style={{
                            marginRight: '10px',
                            marginBottom: '10px',
                            padding: '8px 16px',
                            backgroundColor: isTyping ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isTyping ? 'not-allowed' : 'pointer'
                        }}
                    >
                        添加消息 {index + 1}
                    </button>
                ))}
            </div>

            {/* 消息容器 */}
            <div 
                ref={containerRef}
                style={{
                    flex: 1,
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    overflowY: 'auto',
                    maxHeight: '400px'
                }}
            >
                {/* 历史消息 */}
                {messages.map((msg, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        <div 
                            dangerouslySetInnerHTML={{ 
                                __html: require('../../utils/markdownIt').md.render(msg) 
                            }}
                            style={{
                                padding: '10px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                border: '1px solid #e9ecef'
                            }}
                        />
                    </div>
                ))}

                {/* 当前正在打字的消息 */}
                {isTyping && currentMessage && (
                    <div style={{ marginBottom: '20px' }}>
                        <Typewriter
                            message={currentMessage}
                            speed={30}
                            onComplete={handleComplete}
                            scrollToBottom={scrollToBottom}
                            scrollInterval={5} // 每5个字符滚动一次
                            className="current-message"
                        />
                    </div>
                )}
            </div>

            {/* 说明 */}
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p><strong>功能说明：</strong></p>
                <ul>
                    <li>点击按钮添加新消息，会触发打字机效果</li>
                    <li>打字过程中会自动滚动到底部，确保看到最新内容</li>
                    <li>每5个字符滚动一次，避免过于频繁的滚动</li>
                    <li>打字完成后也会滚动一次，确保完全显示</li>
                    <li>支持 Markdown 语法和代码高亮</li>
                </ul>
            </div>
        </div>
    );
};

export default ScrollTypewriterExample; 