import { useCallback, useEffect, useState } from 'react';
import { Bar, Button, Card, Hint, SectionTag } from '../components/Layout';
import { useApp } from '../store';
import { api } from '../api';

const TH = 'border border-[#eee] bg-[#f5f5f5] px-2.5 py-1.5 text-left font-medium text-[#666]';
const TD = 'border border-[#eee] px-2.5 py-1.5';
const CODE = 'rounded-[3px] bg-[#f2f3f5] px-1.5 py-px text-[13px] text-[#333]';

/** Tab 3：纠错词典 —— 从标注样本生成候选 → 勾选采纳 → 生效词典管理 */
export default function DictPane() {
  const { toast } = useApp();
  const [pairs, setPairs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [checked, setChecked] = useState({}); // { [index]: true }
  const [loadingSuggest, setLoadingSuggest] = useState(false);

  const loadDict = useCallback(async () => {
    try {
      const j = await api.getCorrections();
      const list = j.pairs || [];
      setPairs(list);
      return list;
    } catch {
      setPairs([]);
      return [];
    }
  }, []);

  const loadSuggest = useCallback(async () => {
    setLoadingSuggest(true);
    try {
      const j = await api.getSuggestions();
      setSuggestions(j.suggestions || []);
      setChecked({});
      return j.suggestions || [];
    } catch (e) {
      toast('生成建议失败：' + e.message);
      return [];
    } finally {
      setLoadingSuggest(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDict();
    loadSuggest();
  }, [loadDict, loadSuggest]);

  /** 全量提交词典；成功后刷新候选表（已收录项自动置灰） */
  const saveDict = async (nextPairs, msg) => {
    try {
      await api.saveCorrections(nextPairs);
      setPairs(nextPairs);
      toast(msg || '已保存');
      await loadSuggest();
    } catch (e) {
      toast('保存失败：' + e.message);
    }
  };

  const removePair = (i) => {
    saveDict(
      pairs.filter((_, idx) => idx !== i),
      '已删除该纠错项'
    );
  };

  const selectAll = () => {
    const next = {};
    suggestions.forEach((s, i) => {
      if (!s.inDict) next[i] = true;
    });
    setChecked(next);
  };

  const adopt = () => {
    const picked = suggestions.filter((s, i) => checked[i] && !s.inDict);
    if (!picked.length) {
      toast('请先勾选要采纳的候选');
      return;
    }
    const exist = new Set(pairs.map((p) => p.wrong + '\u0001' + p.right));
    const next = pairs.slice();
    let added = 0;
    for (const s of picked) {
      const key = s.wrong + '\u0001' + s.right;
      if (exist.has(key)) continue;
      next.push({ wrong: s.wrong, right: s.right, fromSamples: s.count, used: 0 });
      exist.add(key);
      added++;
    }
    if (!added) {
      toast('勾选的候选都已在词典中');
      return;
    }
    saveDict(next, '已采纳 ' + added + ' 条纠错项，立即生效');
  };

  return (
    <Card>
      <Bar
        title="识别纠错词典（错词 → 正确词）"
        sub="引擎常把专词听错（如“01左”→“东摇锁”）。把已标注样本的“引擎错文 vs 人工正句”提炼成纠错项后，识别文本会先替换、再进关键词匹配。"
      />

      {/* ---------- 建议候选 ---------- */}
      <div>
        <div className="mb-1.5 mt-3 flex flex-wrap items-center justify-between gap-2.5">
          <SectionTag className="!my-0">建议候选（来自已标注样本）</SectionTag>
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadSuggest} disabled={loadingSuggest}>
              {loadingSuggest ? '生成中…' : '从标注样本生成建议'}
            </Button>
            <Button onClick={selectAll}>全选未收录</Button>
            <Button variant="primary" onClick={adopt}>
              采纳选中 → 加入词典
            </Button>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TH + ' w-[44px]'}>采纳</th>
              <th className={TH}>引擎误识（错词）</th>
              <th className={TH}>应纠正为</th>
              <th className={TH + ' w-[56px]'}>频次</th>
              <th className={TH}>来源样本</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-[#eee] py-3 text-center text-[#aaa]">
                  暂无候选。先在样本列表把"校正文本（完整句子）"与"应勾选项"填对并保存，再回来点生成。
                </td>
              </tr>
            ) : (
              suggestions.map((s, i) => {
                const demo = (s.examples || [])
                  .map((e) => e.asrText + ' ⇒ ' + e.correctedText)
                  .join(' ｜ ');
                return (
                  <tr key={s.wrong + '\u0001' + s.right + i} className={s.inDict ? 'opacity-50' : ''}>
                    <td className={TD + ' text-center'}>
                      <input
                        type="checkbox"
                        disabled={!!s.inDict}
                        checked={!!checked[i]}
                        onChange={(e) => setChecked((prev) => ({ ...prev, [i]: e.target.checked }))}
                      />
                    </td>
                    <td className={TD}>
                      <code className={CODE + (s.inDict ? ' line-through' : '')}>{s.wrong}</code>
                    </td>
                    <td className={TD}>
                      <span className="mx-1.5 text-[#b0b0b0]">→</span>
                      <code className={CODE + (s.inDict ? ' line-through' : '')}>{s.right}</code>
                    </td>
                    <td className={TD + ' text-xs text-[#999]'}>{s.count}</td>
                    <td className={TD}>
                      <div
                        className="max-w-[340px] truncate text-[11px] text-[#aaa]"
                        title={demo}
                      >
                        {demo.length > 70 ? demo.slice(0, 70) + '…' : demo}
                      </div>
                      {s.inDict && (
                        <span className="mt-1 inline-block rounded-[3px] bg-chipbg px-1.5 py-px text-[11px] text-ok">
                          已收录
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- 生效中的词典 ---------- */}
      <div>
        <SectionTag>生效中的纠错词典（识别前先替换，长词优先）</SectionTag>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TH}>错词</th>
              <th className={TH}>正词</th>
              <th className={TH + ' w-[90px]'}>累计命中</th>
              <th className={TH + ' w-[80px]'}>操作</th>
            </tr>
          </thead>
          <tbody>
            {pairs.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-[#eee] py-3 text-center text-[#aaa]">
                  词典为空 —— 标注样本后点上方"生成建议"。
                </td>
              </tr>
            ) : (
              pairs.map((p, i) => (
                <tr key={p.wrong + '\u0001' + p.right + i}>
                  <td className={TD}>
                    <code className={CODE}>{p.wrong}</code>
                  </td>
                  <td className={TD}>
                    <span className="mx-1.5 text-[#b0b0b0]">→</span>
                    <code className={CODE}>{p.right}</code>
                  </td>
                  <td className={TD + ' text-xs text-[#999]'}>{p.used || 0} 次</td>
                  <td className={TD}>
                    <Button size="mini" variant="danger" onClick={() => removePair(i)}>
                      删除
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Hint>
        工作流：录音 → 听音频 → 在样本列表把"人工校正文本"填成完整正确句子、"应勾选项"点好 → 保存 →
        回来点"生成建议"→ 勾选采纳。单字/含标点/超长碎片已被自动过滤，防止误伤。
      </Hint>
    </Card>
  );
}
