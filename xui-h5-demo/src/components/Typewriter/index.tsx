import React, { useEffect, useState, useRef, memo } from 'react';
import { md } from '../../utils/markdownIt';
import './index.css';
import { scrollToBottom } from '../../utils';


const scrollInterval = 50;

interface TypewriterProps {
    message: string;
    speed?: number; // 打字速度（毫秒）
    onComplete?: () => void; // 打字完成回调
    className?: string;
}

interface TypewriterState {
    currentText: string;
    isTyping: boolean;
    currentIndex: number;
}

const Typewriter: React.FC<TypewriterProps> = memo(({
    message,
    speed = 50,
    onComplete,
    className = '',
}) => {
    const [state, setState] = useState<TypewriterState>({
        currentText: '',
        isTyping: false,
        currentIndex: 0
    });
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 将文本转换为HTML标记
    const renderMarkdown = (text: string) => {
        try {
            return md.render(text);
        } catch (error) {
            console.error('Markdown rendering error:', error);
            return text;
        }
    };

    // 打字效果的核心逻辑
    useEffect(() => {
        if (!message) return;

        setState(prev => ({
            ...prev,
            isTyping: true,
            currentIndex: 0,
            currentText: ''
        }));

        const typeNextCharacter = () => {
            setState(prev => {
                if (prev.currentIndex >= message.length) {
                    // 打字完成
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                        timerRef.current = null;
                    }
                    onComplete?.();
                    // 打字完成时滚动到底部
                    scrollToBottom({ container: document.getElementById('chatContent') });
                    return {
                        ...prev,
                        isTyping: false
                    };
                }

                const nextIndex = prev.currentIndex + 1;
                const nextText = message.slice(0, nextIndex);

                // 设置下一个字符的定时器
                timerRef.current = setTimeout(typeNextCharacter, speed);

                return {
                    ...prev,
                    currentText: nextText,
                    currentIndex: nextIndex
                };
            });
        };

        // 开始打字
        timerRef.current = setTimeout(typeNextCharacter, speed);

        // 清理函数
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [message, speed, onComplete, scrollToBottom]);

    // 监听文本变化，在特定间隔调用滚动
    useEffect(() => {
        if (scrollToBottom && state.currentText && state.isTyping) {
            // 每 scrollInterval 个字符滚动一次
            if (state.currentIndex % scrollInterval === 0) {
                // 使用 setTimeout 确保 DOM 更新后再滚动
                setTimeout(() => {
                    scrollToBottom({ container: document.getElementById('chatContent') });
                }, 0);
            }
        }
    }, [state.currentText, state.currentIndex, scrollToBottom, scrollInterval, state.isTyping]);

    // 组件卸载时清理定时器
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className={`typewriter-container ${className}`}
            style={{ 
                overflowX: 'auto',
                minHeight: '1em'
            }}
        >
            <div 
                dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(state.currentText) 
                }}
                style={{
                    // whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}
            />
        </div>
    );
});

Typewriter.displayName = 'Typewriter';

export default Typewriter; 