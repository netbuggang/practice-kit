import { useCallback, useEffect, useState, useRef } from 'react';
import { message } from 'antd';
// 获取URL的参数接口（明文）
export const paramsUrl = () => {
  let url =
    window.location.href &&
    window.location.href.split("?") &&
    window.location.href.split("?")[1];
  const agentParams = {};
  if (url) {
    const urlParams = url
      ? new URLSearchParams(window.location.href.split("?")[1])
      : {};

    urlParams.forEach((value, key) => {
      agentParams[key] = value.split("#")[0];
      if (agentParams[key] == "true" || agentParams[key] == "false") {
        agentParams[key] = JSON.parse(agentParams[key]);
      }
    });

    let list = (agentParams.agentUrl || "https://agent.antdigital.com/lx/agentStreamChat.json").split("/");
    let agentUrl = list.splice(3).join("/");
    let winUrl = list[0] + "//" + list[2];

    const port = window.location.port;
    agentParams["requestUrl"] = agentUrl;
    agentParams["winUrl"] = winUrl;
  }

  return agentParams;
};


const configUrl = 'https://premrtc.mpaas.cn-hangzhou.aliyuncs.com/asr/getToken?tenantCode=NpZ_5pv1';

const socketUrl = 'wss://nls-gateway.cn-shanghai.aliyuncs.com/ws/v1?token=';

// 获取url上的参数
const urlParams: any = paramsUrl();

interface IAlibabacloudNls {
  appkey: string;
  token: string;
}

export const useAlibabacloudNls = () => {

  const websocket = useRef<WebSocket | null>();
  const audioContext = useRef<any>();
  const scriptProcessor = useRef<any>();
  const audioInput = useRef<any>();
  const audioStream = useRef<any>();
  const dataArrRef = useRef<any>([]);

  const [messageText, setMessageText] = useState<string>('');
  const [wsConfig, setWsConfig] = useState<IAlibabacloudNls>({ appkey: '', token: '' });
  // 未连接、连接中、已连接、错误
  const [status, setStatus] = useState<'unconnected' | 'connecting' | 'connected' | 'error'>('unconnected');

  // 生成 UUID
  const generateUUID = () => {
    // @ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    ).replace(/-/g, '');
  };

  // 打开WebSocket连接
  const connectWebSocket = ({ appkey, token }: IAlibabacloudNls) => {
    setStatus('connecting');
    if (!appkey || !token) {
      setStatus('error');
      message.error('获取配置失败');
      return;
    }
    const url = `${socketUrl}${token}`;

    websocket.current = new WebSocket(url);
    websocket.current.onopen = function () {
      console.log('连接到 WebSocket 服务器');
      setStatus('connected');

      var startTranscriptionMessage = {
        header: {
          appkey: appkey,
          namespace: "SpeechTranscriber",
          name: "StartTranscription",
          task_id: generateUUID(),
          message_id: generateUUID()
        },
        payload: {
          "format": "pcm",
          "sample_rate": 16000,
          "enable_intermediate_result": true,
          "enable_punctuation_prediction": true,
          "enable_inverse_text_normalization": true
        }
      };

      websocket.current?.send(JSON.stringify(startTranscriptionMessage));
    };

    websocket.current.onmessage = function (event: any) {
      const message: any = JSON.parse(event.data);
      // console.log('服务端: ', message);
      if (message.header.name === "TranscriptionStarted") {
        console.log('录制中...');
        startRecording();
      } else if (['SentenceBegin', 'TranscriptionResultChanged', 'SentenceEnd'].includes(message.header.name)) {
        setMessageText(message.payload.result);
      }
    };

    websocket.current.onerror = function (event) {
      setStatus('error');
      console.log('WebSocket 错误: ', event);
    };

    websocket.current.onclose = function () {
      console.log('与 WebSocket 服务器断开');
    };
  };

  // 断开WebSocket连接
  const disconnectWebSocket = () => {
    if (websocket.current) {
      websocket.current?.close();
    }
    console.log('未连接');
  };

  // 开始录音
  const startRecording = async () => {
    try {
      // 获取音频输入设备
      audioStream.current = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: true, 
        noiseSuppression: true,
        autoGainControl: true
      } });
      // @ts-ignore
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      audioInput.current = audioContext.current.createMediaStreamSource(audioStream.current);

      // 设置缓冲区大小为2048的脚本处理器
      scriptProcessor.current = audioContext.current.createScriptProcessor(2048, 1, 1);

      scriptProcessor.current.onaudioprocess = function (event: any) {
        const inputData = event.inputBuffer.getChannelData(0);
        const inputData16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; ++i) {
          inputData16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF; // PCM 16-bit
        }
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
          websocket.current.send(inputData16.buffer);
          // console.log('发送音频数据块');
        }
      };

      audioInput.current.connect(scriptProcessor.current);
      scriptProcessor.current.connect(audioContext.current.destination);
    } catch (e) {
      setStatus('error');
      stopRecording();
      console.log('录音失败: ', e);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (scriptProcessor.current) {
      scriptProcessor.current.disconnect();
    }
    if (audioInput.current) {
      audioInput.current.disconnect();
    }
    if (audioStream.current) {
      audioStream.current.getTracks().forEach((track: any) => track.stop());
    }
    if (audioContext.current) {
      audioContext.current.close();
    }
  };

  const getConfig = async () => {
    const res = await fetch(configUrl).catch((e) => { });
    const data = await res?.json();

    const { success, appKeys, appToken } = data || {};
    if (!success) {
      message.error('获取配置失败');
      return;
    }
    const keys = JSON.parse(appKeys);
    const language = urlParams?.language || 'cn';
    setWsConfig({ appkey: keys[language], token: appToken });
  };

  const startRecord = useCallback(() => {
    setStatus('unconnected');
    setMessageText('');
    connectWebSocket(wsConfig);
  }, [wsConfig]);

  const stopRecord = () => {
    stopRecording();
    disconnectWebSocket();
    setStatus('unconnected');
  };

  useEffect(() => {
    getConfig();

    return () => { };
  }, []);

  return {
    status,
    dataArr:dataArrRef.current,
    messageText,
    startRecord,
    stopRecord
  };
};
