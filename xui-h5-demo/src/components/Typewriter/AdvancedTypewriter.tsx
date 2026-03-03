import React, { useEffect, useState, useRef, memo } from 'react';
import { md } from '../../utils/markdownIt';
import './index.css';
import { scrollToBottom } from '../../utils';

const scrollInterval = 50;

interface AdvancedTypewriterProps {
    message: string;
    speed?: number;
    onComplete?: () => void;
    className?: string;
    pauseOnPunctuation?: boolean; // 在标点符号处暂停
    pauseDuration?: number; // 暂停持续时间
}

interface AdvancedTypewriterState {
    currentText: string;
    isTyping: boolean;
    currentIndex: number;
}

const AdvancedTypewriter: React.FC<AdvancedTypewriterProps> = memo(({
    message,
    speed = 50,
    onComplete,
    className = '',
    pauseOnPunctuation = true,
    pauseDuration = 500,
}) => {
    const [state, setState] = useState<AdvancedTypewriterState>({
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

    // 检查是否为标点符号
    const isPunctuation = (char: string) => {
        return /[.!?;:,]/.test(char);
    };

    // 计算下一个字符的延迟时间
    const getNextDelay = (currentChar: string, nextChar: string) => {
        let delay = speed;
        
        if (pauseOnPunctuation && isPunctuation(currentChar)) {
            delay += pauseDuration;
        }
        
        // 在句子开头稍微延迟
        if (currentChar === '.' && nextChar && /[A-Z]/.test(nextChar)) {
            delay += pauseDuration / 2;
        }
        
        return delay;
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
                    scrollToBottom?.({ container: document.getElementById('chatContent') });
                    return {
                        ...prev,
                        isTyping: false
                    };
                }

                const nextIndex = prev.currentIndex + 1;
                const nextText = message.slice(0, nextIndex);
                const currentChar = message[prev.currentIndex];
                const nextChar = message[nextIndex];

                // 计算延迟时间
                const delay = getNextDelay(currentChar, nextChar);

                // 设置下一个字符的定时器
                timerRef.current = setTimeout(typeNextCharacter, delay);

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
    }, [message, speed, onComplete, pauseOnPunctuation, pauseDuration, scrollToBottom]);

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
            className={`typewriter-container advanced-typewriter ${className}`}
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
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}
            />
            {state.isTyping && (
                <span className="typewriter-cursor" />
            )}
        </div>
    );
});

AdvancedTypewriter.displayName = 'AdvancedTypewriter';

export default AdvancedTypewriter; 