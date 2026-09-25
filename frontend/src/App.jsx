/**
 * VoiceRec 主界面
 *
 * 功能：
 *  1. 麦克风录音（MediaRecorder），松手/停止后自动上传识别
 *  2. 本地音频文件上传识别
 *  3. 展示识别结果（文本 / 语种 / 情感 / 事件 / 耗时）
 *  4. 历史记录列表（来自后端 SQLite）
 */
import React, { useEffect, useRef, useState } from 'react';
import { transcribeAudio, fetchHealth, fetchRecords, deleteRecord } from './api';

const LANG_LABEL = { zh: '中文', en: '英文', yue: '粤语', ja: '日文', ko: '韩文' };
const EMOTION_LABEL = { NEUTRAL: '中性', HAPPY: '高兴', SAD: '悲伤', ANGRY: '愤怒', SURPRISE: '惊讶', FEARFUL: '恐惧', DISGUSTED: '厌恶' };
const EVENT_LABEL = { Speech: '语音', BGM: '音乐', Applause: '掌声', Laughter: '笑声', Crying: '哭声', Sneeze: '喷嚏', Cough: '咳嗽' };

export default function App() {
  // ---- 录音相关状态 ----
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // ---- 识别结果 / 历史 ----
  const [result, setResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [backendReady, setBackendReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---- 文件上传 ----
  const fileInputRef = useRef(null);

  /** 初始加载：健康检查 + 历史记录 */
  useEffect(() => {
    fetchHealth()
      .then((d) => setBackendReady(!!d.ready))
      .catch(() => setBackendReady(false));
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const data = await fetchRecords(100);
      setRecords(data.list || []);
    } catch (e) {
      setError(`加载历史失败: ${e.message}`);
    }
  }

  /** 上传并识别（通用入口） */
  async function handleRecognize(file) {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await transcribeAudio(file);
      setResult(data);
      loadRecords(); // 刷新历史
    } catch (e) {
      setError(`识别失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  // ---------- 录音逻辑 ----------
  async function startRecording() {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('当前浏览器不支持录音（需 HTTPS 或 localhost）');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        stream.getTracks().forEach((t) => t.stop());
        if (blob.size > 0) {
          const name = `recording-${Date.now()}.${mime.includes('webm') ? 'webm' : 'm4a'}`;
          handleRecognize(new File([blob], name, { type: mime }));
        } else {
          setError('录音为空，请重试');
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSec(0);
      timerRef.current = setInterval(() => setRecordingSec((s) => s + 1), 1000);
    } catch (e) {
      setError(`无法访问麦克风: ${e.message}`);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
  }

  async function handleDelete(id) {
    try {
      await deleteRecord(id);
      loadRecords();
    } catch (e) {
      setError(`删除失败: ${e.message}`);
    }
  }

  const fmtTime = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`);

  return (
    <div className="page">
      <header className="header">
        <h1>VoiceRec 本地语音识别</h1>
        <span className={`badge ${backendReady ? 'badge-ok' : 'badge-off'}`}>
          {backendReady ? '● 后端就绪' : '○ 后端离线'}
        </span>
      </header>

      {/* 识别入口 */}
      <section className="card">
        <div className="recorder">
          <button
            className={`btn-record ${isRecording ? 'btn-record-active' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
          >
            {isRecording ? '■ 停止录音' : '● 开始录音'}
          </button>
          {isRecording && <span className="rec-timer">{fmtTime(recordingSec)}</span>}
          <span className="divider">或</span>
          <button className="btn" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            选择音频文件
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleRecognize(e.target.files[0])}
          />
        </div>
        {loading && <p className="hint">识别中…（SenseVoice 本地推理，通常 &lt; 1 秒）</p>}
        {error && <p className="error">{error}</p>}
      </section>

      {/* 识别结果 */}
      {result && (
        <section className="card">
          <div className="card-title">识别结果{result.recordId ? ` · 记录 #${result.recordId}` : ''}</div>
          <p className="result-text">{result.text || '（无语音内容）'}</p>
          <div className="meta">
            <span className="chip">{LANG_LABEL[result.lang] || result.lang || '-'}</span>
            <span className="chip">{EMOTION_LABEL[result.emotion] || result.emotion || '-'}</span>
            <span className="chip">{EVENT_LABEL[result.event] || result.event || '-'}</span>
            <span className="chip">{result.durationSec}s · {result.elapsedMs}ms</span>
          </div>
        </section>
      )}

      {/* 历史记录 */}
      <section className="card">
        <div className="card-title">历史记录（{records.length}）</div>
        {records.length === 0 ? (
          <p className="hint">暂无记录，先识别一段音频吧。</p>
        ) : (
          <ul className="record-list">
            {records.map((r) => (
              <li key={r.id} className="record-item">
                <div className="record-main">
                  <div className="record-text">{r.text || '（空）'}</div>
                  <div className="record-meta">
                    {r.createdAt} · {LANG_LABEL[r.lang] || r.lang || '-'} · {r.durationSec}s · {r.elapsedMs}ms
                    {r.audioFilename && ` · ${r.audioFilename}`}
                  </div>
                </div>
                <button className="btn-delete" onClick={() => handleDelete(r.id)}>删除</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">SenseVoice Small · sherpa-onnx · SQLite · 完全本地离线</footer>
    </div>
  );
}
