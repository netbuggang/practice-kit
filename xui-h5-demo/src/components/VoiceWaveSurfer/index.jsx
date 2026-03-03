import React, { useRef, useEffect } from 'react';

const MicrophoneVisualizer = () => {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArray = useRef(new Uint8Array());
	const timer = useRef(0);

  useEffect(() => {
    let audioContext;
    let source;
    let analyser;

    const setupMicrophone = async () => {
      navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: true, 
        noiseSuppression: true,
        autoGainControl: true,
      } })
        .then((stream) => {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 64;
          const bufferLength = analyser.frequencyBinCount;

          dataArray.current = new Uint8Array(bufferLength);
          source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          analyserRef.current = analyser;
        })
        .catch((err) => console.error('Error accessing microphone:', err));
    };

    setupMicrophone();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const drawRoundedRect = (ctx, x, y, width, height, radius, fill = true, stroke = false) =>  {
    ctx.beginPath();
    // 移动到左上角起点（不包括圆角）
    ctx.moveTo(x + radius, y);
    // 画上边
    ctx.lineTo(x + width - radius, y);
    // 左上角圆角
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    // 画右边
    ctx.lineTo(x + width, y + height - radius);
    // 右上角圆角
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    // 画下边
    ctx.lineTo(x + radius, y + height);
    // 右下角圆角
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    // 画左边
    ctx.lineTo(x, y + radius);
    // 左下角圆角
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();

    if (fill) {
        ctx.fill(); // 填充
    }
    if (stroke) {
        ctx.stroke(); // 描边
    }
	}


  useEffect(() => {
    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      analyserRef.current?.getByteFrequencyData(dataArray.current);

      const barWidth = 6;
      let x = 0;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < dataArray.current.length; i++) {
        const barHeight = dataArray.current[i];

        ctx.fillStyle = `rgb(${barHeight + 100}, ${barHeight + 50}, ${barHeight})`;
				drawRoundedRect(ctx, canvas.width / 2 + x, canvas.height / 2 - barHeight / 8 , barWidth, barHeight / 4 + 10, barWidth / 2)
				drawRoundedRect(ctx, canvas.width / 2 - x, canvas.height / 2 - barHeight / 8, barWidth, barHeight / 4 + 10, barWidth / 2)
        // ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 10;
				// timer.current = timer.current + 1;
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [analyserRef.current,canvasRef.current]);

  return (
    <div>
      <canvas ref={canvasRef} width="300" height="150"></canvas>
    </div>
  );
};

export default MicrophoneVisualizer;