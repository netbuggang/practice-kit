import React, { useEffect } from 'react';

function addSpinnerStyle() {
  if (document.getElementById('render-sdk-spinner-style')) return;
  const style = document.createElement('style');
  style.id = 'render-sdk-spinner-style';
  style.innerHTML = `
    .render-sdk-spinner {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100px;
      min-width: 100%;
    }
    .render-sdk-spin {
      display: inline-block;
      position: relative;
      width: 32px;
      height: 32px;
      animation: render-sdk-spin-rotate 1s linear infinite;
    }
    .render-sdk-spin-dot {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 100%;
      background: #1677ff;
      opacity: 0.6;
      transition: background 0.3s;
    }
    .render-sdk-spin-dot:nth-child(1) {
      top: 0;
      left: 50%;
      margin-left: -4px;
      background: #1677ff;
      opacity: 1;
    }
    .render-sdk-spin-dot:nth-child(2) {
      right: 0;
      top: 50%;
      margin-top: -4px;
      background: #69b1ff;
      opacity: 0.8;
    }
    .render-sdk-spin-dot:nth-child(3) {
      left: 50%;
      bottom: 0;
      margin-left: -4px;
      background: #91caff;
      opacity: 0.7;
    }
    .render-sdk-spin-dot:nth-child(4) {
      left: 0;
      top: 50%;
      margin-top: -4px;
      background: #c6e2ff;
      opacity: 0.6;
    }
    @keyframes render-sdk-spin-rotate {
      100% { transform: rotate(360deg); }
    }
    .render-sdk-spinner-text {
      margin-top: 12px;
      color: #1677ff;
      font-size: 14px;
      text-align: center;
      user-select: none;
      letter-spacing: 0.5px;
    }
  `;
  document.head.appendChild(style);
}

const Loading = ({ text }) => {
    useEffect(() => {
        addSpinnerStyle();
    }, []);

    return (
        <div className="render-sdk-spinner">
            <span className="render-sdk-spin">
                <span className="render-sdk-spin-dot"></span>
                <span className="render-sdk-spin-dot"></span>
                <span className="render-sdk-spin-dot"></span>
                <span className="render-sdk-spin-dot"></span>
            </span>
            {text && <div className="render-sdk-spinner-text">{text}</div>}
        </div>
    );
};

export default Loading; 