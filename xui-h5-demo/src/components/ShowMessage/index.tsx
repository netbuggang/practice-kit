import React, { memo } from "react";
// import { md } from '../../utils/markdownIt'
import Typewriter from "../Typewriter";
declare global {
  interface Window {
    MPAASXui: any;
  }
}

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  message: string;
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新状态允许渲染备用UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 可以将错误信息发送到服务器
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 可以渲染任何备用 UI
      return <div style={{ overflowX: "scroll" }} dangerouslySetInnerHTML={{ __html: this.props.message }}></div>;
    }
    return this.props.children;
  }
}

interface ShowMessageProps {
  message: string;
  useTypewriter?: boolean; // 是否使用打字机效果
  typewriterSpeed?: number; // 打字机速度
  onRenderComplete?: () => void; // 渲染完成回调
  MPAASXuiRef: any;
}

export default memo(
  React.forwardRef<HTMLDivElement, ShowMessageProps>((props, ref) => {
    const { message, useTypewriter = false, typewriterSpeed = 10, onRenderComplete, MPAASXuiRef } = props;

    // 如果启用打字机效果，使用 Typewriter 组件
    if (useTypewriter) {
      return (
        <ErrorBoundary message={message}>
          <div ref={ref}>
            <Typewriter
              message={message}
              speed={typewriterSpeed}
              onComplete={() => {
                onRenderComplete?.();
              }}
              className="show-message-typewriter"
            />
          </div>
        </ErrorBoundary>
      );
    }

    // 原有的静态渲染方式
    return (
      <ErrorBoundary message={message}>
        <div ref={ref} style={{ overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: MPAASXuiRef.current.renderMarkdown(message) }}></div>
      </ErrorBoundary>
    );
  }),
  (prevProps, nextProps) => {
    // 自定义比较函数，返回 true 表示不需要重新渲染
    return (
      prevProps.message === nextProps.message && prevProps.useTypewriter === nextProps.useTypewriter && prevProps.typewriterSpeed === nextProps.typewriterSpeed
    );
  },
);
