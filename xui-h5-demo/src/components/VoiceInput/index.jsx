import React, { useEffect, useState, useRef } from 'react';
import { useGesture } from '@use-gesture/react';
import { useAlibabacloudNls } from './useAlibabacloudNls';
import MicVisualizer from '../VoiceWaveSurfer';
import styles from './index.less';

const maxY = -120;

const VoiceInput = (props) => {
  const {
    onChangePress = () => { },
    handleSendMessage = () => { },
  } = props;

  const { status, messageText, dataArr, startRecord, stopRecord } = useAlibabacloudNls();

  // 是否按下录音按钮
  const [isPress, setIsPress] = useState(false);
  const [achieve, setAchieve] = useState(false);

  const onTouchStart = (e) => {
    e && e.preventDefault(); // 阻止默认行为
    setIsPress(true);
    onChangePress(true);
    startRecord();
    
  };

  const onTouchEnd = (e) => {
    e && e.preventDefault(); // 阻止默认行为
    stopRecord();
    setTimeout(() => {
      setIsPress(false);
      onChangePress(false);
    }, 300);
  };

  const sendMsg = () => {
    const sendMsg = messageText;
    if (sendMsg) {
      // console.log('发送', sendMsg);
      handleSendMessage(sendMsg);
    }
  };

  const bind = useGesture({
    onDrag: (state) => {
      const { down, movement: [x, y] } = state;
      if (down && y < maxY) {
        setAchieve(true);
      } else {
        setAchieve(false);
      }
    },
    onDragEnd: (state) => {
      const { movement: [x, y] } = state;
      if (y < maxY) {
        // console.log('取消发送');
      } else {
        // console.log('发送');
        sendMsg();
      }
      onTouchEnd();
    }
  });

  return (
    <div className={styles.voiceInputWrap} {...bind()}>
      {isPress && <div className={styles.transcribeWrap}>
        <div className={styles.transcribeContent}>
          {['connecting', 'error'].includes(status) ?
            <div className={styles.loading}>
              {status === 'connecting' && <span>connecting...</span>}
              {status === 'error' && <span style={{ color: '#FE5152' }}>Recording failed</span>}
            </div>
            :
            <>
              <div className={styles.text}>
                {messageText || "You said, I'm listening"}
              </div>

              {/* <div className={styles.img}>
                <img src="/icon/voice.png" />
              </div> */}

              <MicVisualizer>
                
              </MicVisualizer>

              <div className={styles.desc}>
                {!achieve ?
                  <span>Slide up to cancel sending</span> :
                  <span style={{ color: '#FE5152' }}>Release your finger and cancel sending</span>
                }
              </div>
            </>}
        </div>
        <div className={styles.transcribeMask}></div>
      </div>}

      <div className={styles.voiceInput}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        // 鼠标按下
        onMouseDown={onTouchStart}
        // 鼠标松开
        onMouseUp={onTouchEnd}
        onContextMenu={(e) => { e.preventDefault(); }}
      >
        <div className={styles.inputField}>{isPress ? 'Release send' : 'Hold to talk'}</div>
      </div>
    </div>
  );
};

export default VoiceInput;;