import Chip from './Chip';

/**
 * 识别 / 匹配结果展示（文本测试与录音实测共用）
 * 展示：纠错后文本 + 引擎原文对照 + 各清单项 chip（绿色 = 会勾选）
 */
export default function ResultView({ result }) {
  if (!result) return null;

  const { transcript, rawTranscript, groups = [] } = result;
  const items = [];
  let hitCount = 0;
  groups.forEach((g) =>
    (g.items || []).forEach((it) => {
      if (it.checked) hitCount++;
      items.push(it);
    })
  );
  const replaced = !!rawTranscript && rawTranscript !== transcript;

  return (
    <div className="mb-2.5">
      <div className="text-[#555]">
        识别文本：{transcript || '(空，未识别到语音？)'}
      </div>

      {rawTranscript && (
        <div className="mt-1 break-all text-[11px] text-[#aaa]">
          引擎原文：{rawTranscript}
          {replaced ? ` → 已按纠错词典替换为「${transcript}」` : ''}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((it, i) => (
          <Chip
            key={it.id || i}
            label={it.label + (it.checked ? ` ✓（${it.matchedBy}）` : '')}
            on={!!it.checked}
          />
        ))}
      </div>

      {transcript && hitCount === 0 && (
        <div className="mt-2.5 rounded border border-[#fcd34d] bg-[#fffbeb] px-2.5 py-2 text-[11px] leading-relaxed text-[#b45309]">
          ⚠️ 识别到了「<b>{transcript}</b>」但没命中任何 checkbox。若是引擎把词听错了（见上方"引擎原文"），
          在下方<b>「本次录音标注」</b>里把文字改成你听到的正确句子、选好该勾的项并保存，
          再到「识别纠错词典」点「从标注样本生成建议」→ 采纳，即可让这类说法命中。
        </div>
      )}
    </div>
  );
}
