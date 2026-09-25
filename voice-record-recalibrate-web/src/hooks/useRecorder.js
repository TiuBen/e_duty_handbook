import { useCallback, useRef, useState } from 'react';
import { api } from '../api';

/** 挑选浏览器支持的录音格式（与原 admin 页一致） */
function pickMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  for (const t of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

/**
 * 按住说话 → 松开上传识别。
 *
 * 交互：pointerdown 开始录音，pointerup 停止并上传，pointercancel 取消。
 * 状态：idle | recording | uploading
 *
 * 注意：用 ref 保存 recorder/stream/状态，避免闭包拿到过期的 state。
 */
export function useRecorder({ onResult, onError }) {
  const [state, setState] = useState('idle');
  const stateRef = useRef('idle');
  stateRef.current = state;

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const capturingRef = useRef(false);

  const start = useCallback(async () => {
    if (stateRef.current === 'uploading') return;
    try {
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMimeType();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
      capturingRef.current = true;
      setState('recording');
    } catch (e) {
      onError('无法使用麦克风：' + (e?.message || e) + '（需在浏览器地址栏允许麦克风权限）');
      setState('idle');
    }
  }, [onError]);

  const stopAndUpload = useCallback(async () => {
    if (!capturingRef.current || !recorderRef.current) return;
    capturingRef.current = false;
    const recorder = recorderRef.current;
    setState('uploading');

    const stopped = new Promise((resolve) => recorder.addEventListener('stop', resolve, { once: true }));
    recorder.stop();
    await stopped;

    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      const mime = recorder.mimeType || 'audio/webm';
      const blob = new Blob(chunksRef.current, { type: mime });
      const ext = mime.includes('ogg') ? 'ogg' : 'webm';
      const result = await api.recognize(blob, 'rec.' + ext);
      await onResult(result);
    } catch (e) {
      onError('识别失败：' + e.message);
    } finally {
      setState('idle');
    }
  }, [onError, onResult]);

  const cancel = useCallback(() => {
    capturingRef.current = false;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        /* ignore */
      }
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setState('idle');
  }, []);

  return { state, start, stopAndUpload, cancel };
}
