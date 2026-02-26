import { useRef, useEffect } from 'react';

export function useLongPress(onLongPress, { duration = 500, moveThreshold = 10, preventContextMenu = true } = {}) {
  const ref = useRef(null);
  const timerRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0, id: null });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let longPressed = false;

    function clearTimer() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function start(e) {
      const p = e.touches ? e.touches[0] : e;
      startRef.current = { x: p.clientX, y: p.clientY, id: e.pointerId || 'touch' };
      longPressed = false;
      timerRef.current = setTimeout(() => {
        longPressed = true;
        onLongPress && onLongPress(e);
      }, duration);
    }

    function move(e) {
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - startRef.current.x;
      const dy = p.clientY - startRef.current.y;
      if (Math.hypot(dx, dy) > moveThreshold) {
        clearTimer();
      }
    }

    function end() {
      clearTimer();
    }

    if (window.PointerEvent) {
      el.addEventListener('pointerdown', start, { passive: true });
      el.addEventListener('pointermove', move, { passive: true });
      el.addEventListener('pointerup', end, { passive: true });
      el.addEventListener('pointercancel', end, { passive: true });
    } else {
      el.addEventListener('touchstart', start, { passive: true });
      el.addEventListener('touchmove', move, { passive: true });
      el.addEventListener('touchend', end, { passive: true });
      el.addEventListener('mousedown', start, { passive: true });
      el.addEventListener('mousemove', move, { passive: true });
      el.addEventListener('mouseup', end, { passive: true });
    }

    if (preventContextMenu) {
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    return () => {
      clearTimer();
      if (window.PointerEvent) {
        el.removeEventListener('pointerdown', start);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', end);
        el.removeEventListener('pointercancel', end);
      } else {
        el.removeEventListener('touchstart', start);
        el.removeEventListener('touchmove', move);
        el.removeEventListener('touchend', end);
        el.removeEventListener('mousedown', start);
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseup', end);
      }
      if (preventContextMenu) {
        el.removeEventListener('contextmenu', (e) => e.preventDefault());
      }
    };
  }, [onLongPress, duration, moveThreshold, preventContextMenu]);

  return ref; // 在组件中把 ref 绑到元素上
}
