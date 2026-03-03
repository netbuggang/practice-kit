
// 聊天注脚显示文字
export const getFooterData = (value) => {
  const promptMapping = {
    'background/background':'大模型生成',
  };
  return promptMapping[value] || value;
};