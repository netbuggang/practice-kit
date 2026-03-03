import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import locale from "antd/locale/zh_CN";
import Chat from "../chat";
import styles from "./index.less";

const Index = () => {
  useEffect(() => {
    initPage();
  }, []);

  // 准备页面初始化配置
  const initPage = () => {
    const setMeta = (name, content) => {
      const existingMeta = document.querySelector(`meta[name="${name}"]`);
      // 创建新的 meta 标签
      const newMeta = document.createElement("meta");
      newMeta.name = name;
      newMeta.content = content;

      // 替换旧的 meta 标签
      if (existingMeta) {
        existingMeta.parentNode.replaceChild(newMeta, existingMeta);
      } else {
        document.head.appendChild(newMeta);
      }
    };
    //Android 禁止屏幕旋转
    setMeta("screen-orientation", "portrait");
    //全屏显示
    setMeta("full-screen", "yes");
    //防止页面进入全屏模式。
    setMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
    //禁止缩放
    setMeta("viewport", "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, shrink-to-fit=no");

    if ("visualViewport" in window) {
      // window.visualViewport.addEventListener('resize', () => {
      //     // 在这里根据新的视觉视口高度调整页面布局
      //     adjustPageLayout(visualViewport.height);
      // });
      adjustPageLayout(visualViewport.height);
    }
  };

  const adjustPageLayout = (height) => {
    // 根据视觉视口的高度调整页面元素的高度
    document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
  };

  return (
    <ConfigProvider locale={locale}>
      <div className={styles.warpper}>
        <Chat />
      </div>
    </ConfigProvider>
  );
};

export default Index;
