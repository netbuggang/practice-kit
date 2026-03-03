import { getNowDate, scrollToBottom } from '../../utils';
import { getCardChat } from '../service';

// 合并连续的TEXT类型消息，并处理思考内容、跑马灯和正文内容
const mergeConsecutiveTextMessages = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    // 重置状态变量，避免全局状态污染
    let result = [];
    let currentThinkingMessage = null;
    let currentContentMessage = null;
    let currentHorseRideMessage = null;
    
    // 状态标记
    let isInThinkingMode = false; // 标记是否在思考模式中
    let isInHorseRideMode = false; // 标记是否在跑马灯模式中
    let isInContentMode = false; // 标记是否在正文模式中
    
    // 检查是否已经有跑马灯消息存在
    const existingHorseRideMessage = messages.find(msg => msg.templateType === 'HORSE_RIDE');
    
    // 检查是否已经有思考消息存在
    const existingThinkingMessage = messages.find(msg => msg.templateType === 'THINKING');
    
    for (const message of messages) {
        switch (message.templateType) {
            // ========== 跑马灯相关消息 ==========
            case 'HORSE_RIDE_THINKING_START':
                // 开始跑马灯，创建新的跑马灯消息
                isInHorseRideMode = true;
                
                // 检查是否已经存在跑马灯消息
                if (!existingHorseRideMessage) {
                    currentHorseRideMessage = {
                        type: 'BOT',
                        templateType: 'HORSE_RIDE',
                        horseRideContent: {
                            thinkingType: 'HORSE_RIDE',
                            data: message.templateData?.data || '',
                            plans: [] // 存储二级文案
                        },
                        itemKey: message.itemKey,
                        dateTime: message.dateTime || getNowDate(),
                        isCompleted: false
                    };
                } else {
                    // 如果已经存在，更新现有消息
                    currentHorseRideMessage = existingHorseRideMessage;
                    currentHorseRideMessage.horseRideContent.data += message.templateData?.data || '';
                    result.push(currentHorseRideMessage);
                }
                break;

            case 'HORSE_RIDE_THINKING':
                // 跑马灯的一级文案
                if (currentHorseRideMessage) {
                    currentHorseRideMessage.horseRideContent.data += message.templateData?.data || '';
                    currentHorseRideMessage.itemKey = message.itemKey;
                }
                break;

            case 'HORSE_RIDE_PLAN':
                // 跑马灯的二级文案
                if (currentHorseRideMessage) {
                    currentHorseRideMessage.horseRideContent.plans.push(message.templateData?.data || '');
                    currentHorseRideMessage.itemKey = message.itemKey;
                }
                break;

            case 'HORSE_RIDE_THINKING_END':
                // 结束跑马灯，标记为完成但不删除
                isInHorseRideMode = false;
                
                // 确保跑马灯消息存在
                if (!currentHorseRideMessage && existingHorseRideMessage) {
                    currentHorseRideMessage = existingHorseRideMessage;
                }
                
                if (currentHorseRideMessage) {
                    currentHorseRideMessage.isCompleted = true; // 标记为完成
                    // 不在这里添加，让函数结束时处理
                }
                break;

            // ========== 思考相关消息 ==========
            case 'COT_START':
                // 开始思考，创建新的思考消息
                isInThinkingMode = true;
                
                // 检查是否已经存在思考消息
                if (!existingThinkingMessage) {
                    if (currentThinkingMessage) {
                        // 如果已经有思考消息，先保存
                        result.push(currentThinkingMessage);
                    }
                    currentThinkingMessage = {
                        type: 'BOT',
                        templateType: 'THINKING',
                        thinkingContent: {
                            thinkingType: 'COT',
                            data: message.templateData?.data || ''
                        },
                        itemKey: message.itemKey,
                        dateTime: message.dateTime || getNowDate()
                    };
                } else {
                    // 如果已经存在，使用现有消息
                    currentThinkingMessage = existingThinkingMessage;
                    currentThinkingMessage.thinkingContent.data += message.templateData?.data || '';
                }
                break;

            case 'COT_END':
                // 结束思考，保存思考消息
                isInThinkingMode = false;
                if (currentThinkingMessage) {
                    currentThinkingMessage.thinkingContent.data += message.templateData?.data || '';
                    result.push(currentThinkingMessage);
                    currentThinkingMessage = null;
                }
                // 思考结束后，清空跑马灯消息
                if (currentHorseRideMessage) {
                    currentHorseRideMessage = null;
                }
                break;

            // ========== 正文相关消息 ==========
            case 'CONTENT_START':
                // 开始正文，创建新的正文消息
                isInContentMode = true;
                if (currentContentMessage) {
                    // 如果已经有正文消息，先保存
                    result.push(currentContentMessage);
                    currentContentMessage = null;
                }
                // 跑马灯消息保持显示，不清空
                currentContentMessage = {
                    type: 'BOT',
                    templateType: 'TEXT',
                    templateData: {
                        data: message.templateData?.data || ''
                    },
                    itemKey: message.itemKey,
                    dateTime: message.dateTime || getNowDate()
                };
                break;

            case 'CONTENT_END':
                // 结束正文，保存正文消息
                isInContentMode = false;
                if (currentContentMessage) {
                    currentContentMessage.templateData.data += message.templateData?.data || '';
                    result.push(currentContentMessage);
                    currentContentMessage = null;
                }
                break;

            case 'TEXT':
                // 根据当前模式决定是思考内容、跑马灯内容还是正文内容
                if (isInHorseRideMode) {
                    // 在跑马灯模式中，累积到跑马灯消息
                    if (currentHorseRideMessage) {
                        currentHorseRideMessage.horseRideContent.data += message.templateData?.data || '';
                        currentHorseRideMessage.itemKey = message.itemKey;
                    }
                } else if (isInThinkingMode) {
                    // 在思考模式中，累积到思考消息
                    if (currentThinkingMessage) {
                        currentThinkingMessage.thinkingContent.data += message.templateData?.data || '';
                        currentThinkingMessage.itemKey = message.itemKey;
                    } else {
                        // 如果没有思考消息，创建新的
                        currentThinkingMessage = {
                            type: 'BOT',
                            templateType: 'THINKING',
                            thinkingContent: {
                                thinkingType: 'COT',
                                data: message.templateData?.data || ''
                            },
                            itemKey: message.itemKey,
                            dateTime: message.dateTime || getNowDate()
                        };
                    }
                } else if (isInContentMode) {
                    // 在正文模式中，累积到正文消息
                    if (currentContentMessage) {
                        currentContentMessage.templateData.data += message.templateData?.data || '';
                        currentContentMessage.itemKey = message.itemKey;
                    } else {
                        // 如果没有正文消息，创建新的
                        currentContentMessage = {
                            type: 'BOT',
                            templateType: 'TEXT',
                            templateData: {
                                data: message.templateData?.data || ''
                            },
                            itemKey: message.itemKey,
                            dateTime: message.dateTime || getNowDate()
                        };
                    }
                } else {
                    // 不在任何特殊模式中，默认当作正文内容处理
                    if (currentContentMessage) {
                        currentContentMessage.templateData.data += message.templateData?.data || '';
                        currentContentMessage.itemKey = message.itemKey;
                    } else {
                        // 如果没有正文消息，创建新的
                        currentContentMessage = {
                            type: 'BOT',
                            templateType: 'TEXT',
                            templateData: {
                                data: message.templateData?.data || ''
                            },
                            itemKey: message.itemKey,
                            dateTime: message.dateTime || getNowDate()
                        };
                    }
                }
                break;

            // ========== 其他特殊消息 ==========
            case 'FORBIDDEN':
                // 拦截消息，先保存之前的消息
                if (currentContentMessage) {
                    result.push(currentContentMessage);
                    currentContentMessage = null;
                }
                // 创建拦截消息
                result.push({
                    type: 'BOT',
                    templateType: 'TEXT',
                    templateData: {
                        data: message.templateData?.data || ''
                    },
                    itemKey: message.itemKey,
                    dateTime: message.dateTime || getNowDate()
                });
                break;

            case 'CARD':
                // 卡片消息，先保存之前的消息
                if (currentThinkingMessage) {
                    result.push(currentThinkingMessage);
                    currentThinkingMessage = null;
                }
                if (currentContentMessage) {
                    result.push(currentContentMessage);
                    currentContentMessage = null;
                }
                // 跑马灯消息保持显示，不清空
                // 添加卡片消息
                result.push(message);
                break;

            case 'SUG':
                // 建议消息，先保存之前的消息
                if (currentThinkingMessage) {
                    result.push(currentThinkingMessage);
                    currentThinkingMessage = null;
                }
                if (currentContentMessage) {
                    result.push(currentContentMessage);
                    currentContentMessage = null;
                }
                // 跑马灯消息保持显示，不清空
                // 添加建议消息
                result.push(message);
                break;

            case 'WITHDRAW':
                // 撤回消息，先保存之前的消息
                if (currentThinkingMessage) {
                    result.push(currentThinkingMessage);
                    currentThinkingMessage = null;
                }
                if (currentContentMessage) {
                    result.push(currentContentMessage);
                    currentContentMessage = null;
                }
                // 跑马灯消息保持显示，不清空
                // 添加撤回消息
                result.push(message);
                break;

            default:
                // 其他未知类型消息，先保存之前的消息
                if (currentThinkingMessage) {
                    result.push(currentThinkingMessage);
                    currentThinkingMessage = null;
                }
                if (currentContentMessage) {
                    result.push(currentContentMessage);
                    currentContentMessage = null;
                }
                // 跑马灯消息保持显示，不清空
                // 添加当前消息
                result.push(message);
                break;
        }
    }

    // 1. 先添加跑马灯消息（只在思考模式中显示）
    if (isInThinkingMode && currentHorseRideMessage) {
        result.push(currentHorseRideMessage);
    } else if (isInThinkingMode && existingHorseRideMessage) {
        result.push(existingHorseRideMessage);
    }
    
    // 2. 再添加思考消息
    if (currentThinkingMessage) {
        result.push(currentThinkingMessage);
    }
    
    // 3. 最后添加正文消息
    if (currentContentMessage) {
        result.push(currentContentMessage);
    }
    

    return result;
};

let sessionId = "";
let accumulatedStreamMessages = []; // 将累积消息移到函数外部，避免重复初始化

// 重置累积消息的函数
export const resetAccumulatedMessages = () => {
    accumulatedStreamMessages = [];
};

export const processStream = async (buffer, setNowChatList, setSessionId) => {
    
    // 检查是否是新的对话开始，如果是则清空累积消息
    const lines = Array.isArray(buffer) ? buffer : buffer?.split('\n');
    let isNewConversation = false;
    
    for (const line of lines) {
        if (line.includes('chatList')) {
            try {
                const jsonStart = line.indexOf('{');
                if (jsonStart !== -1) {
                    const jsonStr = line.substring(jsonStart);
                    const data = JSON.parse(jsonStr);
                    if (data.chatList && data.chatList.length > 0) {
                        // 检查是否包含新对话开始的标记
                        const hasNewConversationStart = data.chatList.some(item => 
                            item.templateType === 'COT_START' || 
                            item.templateType === 'HORSE_RIDE_THINKING_START'
                        );
                        if (hasNewConversationStart) {
                            isNewConversation = true;
                            break;
                        }
                    }
                }
            } catch (e) {
                // 忽略解析错误
            }
        }
    }
    
    if (isNewConversation && accumulatedStreamMessages.length > 0) {
        accumulatedStreamMessages = [];
    }
    
    try {
        // 尝试解析完整的数据
        for (const line of lines) {
            if (line.trim()) {
                // 尝试更宽松的解析方式
                try {
                    if (line.includes('chatList')) {
                        // 如果包含 chatList，尝试提取 JSON 部分
                        const jsonStart = line.indexOf('{');
                        if (jsonStart !== -1) {
                            const jsonStr = line.substring(jsonStart);
                            const data = JSON.parse(jsonStr);
                            if (data.sessionId) {
                                sessionId = data.sessionId;
                                localStorage.setItem('sessionId', sessionId);
                                setSessionId(sessionId);
                            }
                            // 处理数据
                            if (data.chatList && data.chatList.length > 0) {
                                if (data.chatList.length === 1 && data.chatList[0].templateType === "CONTENT_END") {
                                    continue;
                                }

                                // 将新的消息添加到累积数组中
                                const newMessages = data.chatList.map((item, index) => ({
                                    type: 'BOT',
                                    ...item,
                                    itemKey: item.templateType + index,
                                    dateTime: item.dateTime || getNowDate()
                                }));

                                accumulatedStreamMessages = [...accumulatedStreamMessages, ...newMessages];

                                // 合并累积的消息，处理思考内容和正文内容
                                const mergedMessages = mergeConsecutiveTextMessages(accumulatedStreamMessages);
                                setNowChatList(values => {
                                    // 保留现有的用户消息，移除loading状态
                                    const userMessages = values.filter(item => item.type === 'USER');
                                    
                                    // // 找到现有的包含跑马灯的消息数组
                                    // let existingBotMessages = values.filter(item =>
                                    //     Array.isArray(item) && item.some(msg => msg.templateType === 'HORSE_RIDE')
                                    // );

                                    // 如果合并后的消息不为空
                                    if (mergedMessages.length > 0) {
                                        // 直接使用合并后的消息，让mergeConsecutiveTextMessages处理重复问题
                                        return [
                                            ...userMessages,
                                            mergedMessages,
                                        ];
                                    } else {
                                        return values;
                                    }
                                });

                                scrollToBottom({ container: document.getElementById('chatContent') });
                            }else if (data.chatList.length === 0 && data.hasStream === false){
                                // isNewConversation = true;
                                // 这个时候需要添加一条无法回答的回复消息
                                setNowChatList(values => {
                                    const userMessages = values.filter(item => item.type === 'USER');
                                    return [...userMessages, [{
                                        type: 'BOT',
                                        templateType: 'TEXT',
                                        templateData: { data: '无法回答您的问题。' },
                                    }]];
                                });
                                break;
                            }
                        }
                    }
                } catch (fallbackError) {
                    console.error('宽松解析也失败了:', fallbackError);
                }
            }
        }
        // }
    } catch (error) {
        console.error('流式读取错误:', error);
    }
};
