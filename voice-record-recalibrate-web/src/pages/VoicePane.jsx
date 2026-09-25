import { Fragment, useEffect, useMemo, useState } from 'react';
import { Bar, Button, Card, Hint } from '../components/Layout';
import ResultView from '../components/ResultView';
import SampleRow from '../components/SampleRow';
import SampleTable from '../components/SampleTable';
import { useRecorder } from '../hooks/useRecorder';
import { useApp } from '../store';
import { api } from '../api';

const DEFAULT_VOICE_MSG = '按下即开始录音，松开自动上传识别（整条链路：录音→本地模型→勾选）';
/** 关键词输入：支持中英文逗号、顿号分隔，提交时才解析（输入过程保持原样） */
const parseKeywords = (s) =>
  String(s || '')
    .split(/[，,、]/)
    .map((x) => x.trim())
    .filter(Boolean);

const TH = 'border-b border-[#eee] bg-[#f5f5f5] px-2.5 py-2 text-left font-medium text-[#666]';
const TD = 'border-b border-[#eee] px-2.5 py-2';

/** Tab 1：语音识别 —— 引擎状态 / 文本测试 / 录音实测 / 本次录音标注 / 规则关键词表 */
export default function VoicePane() {
  const { status, statusError, loadStatus, rules, reloadRules, samples, rev, reloadSamples, toast } =
    useApp();

  const [testText, setTestText] = useState('');
  const [result, setResult] = useState(null);
  const [draft, setDraft] = useState(null);
  const [lastSampleId, setLastSampleId] = useState(null);
  const [voiceMsg, setVoiceMsg] = useState(DEFAULT_VOICE_MSG);
  const [savingRules, setSavingRules] = useState(false);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // 规则加载后生成草稿：kwText 保留输入原样，保存时再解析成 keywords
  useEffect(() => {
    setDraft(
      rules
        ? {
            groups: (rules.groups || []).map((g) => ({
              id: g.id,
              name: g.name,
              items: (g.items || []).map((it) => ({
                id: it.id,
                label: it.label,
                kwText: (it.keywords || []).join('，')
              }))
            }))
          }
        : null
    );
  }, [rules]);

  const recorder = useRecorder({
    onResult: async (r) => {
      setResult(r);
      if (r.sample) {
        setLastSampleId(r.sample.id);
        await reloadSamples();
        setVoiceMsg('识别完成，绿色 = 会勾选。下方可直接标注本次录音');
      } else {
        setVoiceMsg('');
        toast('后端未重启：本次录音未返回样本信息，请重启 npm start 后刷新');
      }
    },
    onError: (msg) => {
      setVoiceMsg(msg);
      toast(msg);
    }
  });

  const lastSample = useMemo(
    () => (lastSampleId ? samples.find((s) => s.id === lastSampleId) || null : null),
    [lastSampleId, samples]
  );
  const lastSeq = useMemo(() => {
    if (!lastSample) return 1;
    const idx = samples.findIndex((s) => s.id === lastSample.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [lastSample, samples]);

  const runTextTest = async () => {
    const t = testText.trim();
    if (!t) return;
    try {
      setResult(await api.testText(t));
    } catch (e) {
      toast('测试失败：' + e.message);
    }
  };

  const updateKeyword = (groupId, itemId, value) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        groups: prev.groups.map((g) =>
          g.id !== groupId
            ? g
            : { ...g, items: g.items.map((it) => (it.id !== itemId ? it : { ...it, kwText: value })) }
        )
      };
    });
  };

  const handleSaveRules = async () => {
    if (!draft) return;
    setSavingRules(true);
    try {
      await api.saveRules({
        groups: draft.groups.map((g) => ({
          id: g.id,
          name: g.name,
          items: g.items.map((it) => ({
            id: it.id,
            label: it.label,
            keywords: parseKeywords(it.kwText)
          }))
        }))
      });
      toast('已保存，App 下一次识别即生效');
      await reloadRules();
    } catch (e) {
      toast('保存失败：' + e.message);
    } finally {
      setSavingRules(false);
    }
  };

  const handleResetRules = async () => {
    try {
      await reloadRules();
      toast('已重新加载');
    } catch (e) {
      toast('重新加载失败：' + e.message);
    }
  };

  const voiceStateText =
    recorder.state === 'recording'
      ? '正在录音… 松开结束'
      : recorder.state === 'uploading'
        ? '正在识别…'
        : voiceMsg;

  const voiceBtnCls = [
    'shrink-0 rounded-md border px-5 py-2.5 text-sm transition',
    recorder.state === 'recording'
      ? 'border-danger bg-danger text-white'
      : recorder.state === 'uploading'
        ? 'cursor-wait border-[#e8eaed] bg-[#e8eaed] text-[#666]'
        : 'border-accent bg-white text-accent hover:bg-[#f0f6ff]'
  ].join(' ');

  return (
    <div>
      {/* ---------- 引擎状态 ---------- */}
      <Card>
        <div className="text-[13px] leading-[1.8]">
          {statusError ? (
            <b className="text-danger">无法连接服务器</b>
          ) : !status ? (
            '加载引擎状态...'
          ) : (
            <>
              语音识别引擎：
              <b className={status.asr?.available ? 'text-ok' : 'text-danger'}>
                {status.asr?.available ? '已就绪' : '不可用'}
              </b>
              <br />
              识别方式：{status.asr?.provider || '-'}，模型：
              {status.asr?.available
                ? `${status.asr.type} / ${status.asr.modelDir}`
                : status.asr?.error || '-'}
              <br />
              ffmpeg 转码：
              <b className={status.ffmpeg ? 'text-ok' : 'text-danger'}>
                {status.ffmpeg ? '可用' : '未找到（请安装或放入 bin/）'}
              </b>
            </>
          )}
        </div>
      </Card>

      {/* ---------- 文本测试 + 录音实测 ---------- */}
      <Card>
        <div className="mb-3 flex gap-2">
          <input
            className="flex-1 rounded border border-line px-2.5 py-2 text-sm focus:border-accent focus:outline-none"
            placeholder="输入一句话测试匹配，例如：当前是01左单跑道1类盲降运行"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runTextTest();
            }}
          />
          <Button variant="primary" onClick={runTextTest}>
            文本测试
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={voiceBtnCls}
            disabled={recorder.state === 'uploading'}
            onPointerDown={(e) => {
              if (recorder.state === 'uploading') return;
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId); // 移出按钮也不中断
              recorder.start();
            }}
            onPointerUp={() => recorder.stopAndUpload()}
            onPointerCancel={() => recorder.cancel()}
          >
            🎤 按住说话 · 录音实测
          </button>
          <span
            className={
              'text-xs ' + (recorder.state === 'recording' ? 'text-danger' : 'text-[#999]')
            }
          >
            {voiceStateText}
          </span>
        </div>

        <ResultView result={result} />
        <Hint>提示：绿色 = 会勾选。也可在 App 里长按录音按钮实测整条链路。</Hint>
      </Card>

      {/* ---------- 本次录音标注 ---------- */}
      <Card>
        <Bar
          title="本次录音标注"
          sub={
            <>
              针对刚录的这一条：第一次显示的是<b>引擎匹配结果（只读）</b>；点「修改」后 chip 可手动点选，
              人工校正文本按你<b>点选的顺序</b>自动拼接；改完点「保存」。
            </>
          }
        />
        <SampleTable
          isEmpty={!lastSample}
          emptyText="还没有录音 —— 按住上方 🎤 录一次，本条会自动出现在这里，可直接标注（不必切到「样本标注」页）"
        >
          {lastSample && (
            <SampleRow key={`${lastSample.id}#${rev}`} sample={lastSample} seq={lastSeq} ordered />
          )}
        </SampleTable>
      </Card>

      {/* ---------- 规则关键词表 ---------- */}
      <Card>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TH + ' w-[110px]'}>清单项</th>
              <th className={TH}>关键词（用逗号分隔，命中任意一个即勾选）</th>
            </tr>
          </thead>
          <tbody>
            {(draft?.groups || []).map((g) => (
              <Fragment key={g.id}>
                <tr>
                  <td colSpan={2} className={TD + ' bg-[#f0f4f9] font-semibold'}>
                    {g.name}
                  </td>
                </tr>
                {g.items.map((it) => (
                  <tr key={it.id}>
                    <td className={TD + ' font-semibold'}>{it.label}</td>
                    <td className={TD}>
                      <input
                        className="w-full rounded border border-line px-2 py-1.5 text-[13px] focus:border-accent focus:outline-none"
                        value={it.kwText}
                        onChange={(e) => updateKeyword(g.id, it.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex gap-2">
          <Button variant="primary" disabled={savingRules || !draft} onClick={handleSaveRules}>
            保存规则
          </Button>
          <Button disabled={!draft} onClick={handleResetRules}>
            放弃修改（重新加载）
          </Button>
        </div>
        <Hint>示例："01左单跑道1类盲降运行" → 为 01L 增加 "01左" 关键词即可整句命中。</Hint>
      </Card>
    </div>
  );
}
