import { useState } from 'react';
import Chip from './Chip';
import { Button } from './Layout';
import { api } from '../api';
import { useApp } from '../store';

const sameArr = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const CELL = 'border border-[#eee] px-2.5 py-2 text-left align-top';

/**
 * 一条样本行。
 *
 * 两种形态：
 * - 普通行（样本标注页，ordered=false）：始终可编辑；保存过 → 「已保存 ✓」置灰，
 *   再次改动 → 「保存修改」，保存后回到已保存态。
 * - 本次录音标注（ordered=true）：「只读优先」—— 第一次进来展示**引擎匹配结果（只读）**，
 *   点「修改」后 chip 才可点选，人工校正文本按**点选顺序**自动拼接；点「保存」回到只读态。
 */
export default function SampleRow({ sample, seq, ordered = false, showSeq = true }) {
  const { allItems, toast, applySamplePatch, removeSampleLocal, resolveAudioUrl } = useApp();

  const seedSelected = (sample.marked ? sample.targetChecked : sample.asrChecked) || [];
  const seedText = (sample.marked ? sample.correctedText ?? sample.asrText : sample.asrText) || '';

  const [selected, setSelected] = useState(seedSelected);
  const [text, setText] = useState(seedText);
  const [editable, setEditable] = useState(!ordered); // 普通行默认可编辑；本次录音标注初始只读
  const [baseline, setBaseline] = useState({ selected: seedSelected, text: seedText });
  const [saving, setSaving] = useState(false);

  const marked = !!sample.marked;
  const dirty = text !== baseline.text || !sameArr(selected, baseline.selected);

  /** 已选 chip 的标签，按点选顺序拼接成人工校正文本 */
  const buildText = (ids) => {
    const labelOf = new Map(allItems.map((it) => [it.id, it.label]));
    return ids.map((id) => labelOf.get(id) || id).join('');
  };

  const toggleChip = (id) => {
    if (!editable) {
      toast('点「修改」后才能手动点选');
      return;
    }
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    setSelected(next);
    if (ordered) setText(buildText(next)); // 文本随点选顺序重建
  };

  const handleEditToggle = () => {
    if (!editable) {
      setEditable(true);
      setText(buildText(selected)); // 进入编辑即按当前勾选顺序重建文本
      return;
    }
    // 取消：丢弃本地未保存改动，回到只读
    setSelected(seedSelected);
    setText(seedText);
    setEditable(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveSample(sample.id, { correctedText: text, targetChecked: selected });
      // 写回全局缓存（"本次录音标注"与"样本标注"页同步），rev 递增使本行重挂载到已保存态
      applySamplePatch(sample.id, {
        correctedText: text.trim(),
        targetChecked: selected,
        marked: true,
        updatedAt: new Date().toISOString()
      });
      toast('样本已保存（按钮变灰 = 已入库；再次修改才会启用保存）');
    } catch (e) {
      toast('保存失败：' + e.message);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('删除这条样本及其音频？')) return;
    try {
      await api.deleteSample(sample.id);
      removeSampleLocal(sample.id);
      toast('已删除');
    } catch (e) {
      toast('删除失败：' + e.message);
    }
  };

  // ---------- 标签 / 按钮状态 ----------
  let tagText = '待标注';
  let tagCls = 'bg-[#fef7e0] text-warn';
  let btnText = '保存';
  let btnVariant = 'primary';
  let btnDisabled = false;

  if (ordered) {
    if (!editable) {
      tagText = marked ? '已标注' : '引擎匹配';
      tagCls = marked ? 'bg-chipbg text-ok' : 'bg-[#fef7e0] text-warn';
      btnText = marked ? '已保存 ✓' : '保存';
      btnVariant = marked ? 'saved' : 'primary';
      btnDisabled = true;
    } else {
      tagText = '编辑中';
      tagCls = 'bg-[#fef7e0] text-warn';
    }
  } else if (marked && !dirty) {
    tagText = '已标注';
    tagCls = 'bg-chipbg text-ok';
    btnText = '已保存 ✓';
    btnVariant = 'saved';
    btnDisabled = true;
  } else if (dirty) {
    tagText = '待保存';
    tagCls = 'bg-[#fef7e0] text-warn';
    btnText = marked ? '保存修改' : '保存';
  } else {
    tagText = marked ? '已标注' : '待标注';
    tagCls = marked ? 'bg-chipbg text-ok' : 'bg-[#fef7e0] text-warn';
  }

  return (
    <tr>
      {showSeq && <td className={CELL + ' w-[52px] text-center'}>{seq ?? ''}</td>}

      <td className={CELL + ' w-[190px]'}>
        {sample.audioUrl ? (
          <audio
            className="block h-8 w-full"
            controls
            preload="none"
            src={resolveAudioUrl(sample.audioUrl)}
          />
        ) : (
          <div className="text-[11px] text-[#999]">（音频缺失）</div>
        )}
        <div className="mt-1 text-[11px] text-[#999]">
          {sample.timeStr} · {sample.durationSec != null ? sample.durationSec.toFixed(1) + 's' : ''}
        </div>
      </td>

      <td className={CELL + ' w-[34%]'}>
        <span className={'mb-1 inline-block rounded-[3px] px-1.5 py-px text-[11px] ' + tagCls}>
          {tagText}
        </span>
        <input
          className={
            'w-full rounded border border-line px-2 py-1.5 text-[13px] focus:border-accent focus:outline-none ' +
            (ordered && !editable ? 'bg-[#f7f7f7] text-[#666]' : '')
          }
          placeholder="听音频后填写正确文字…"
          value={text}
          readOnly={ordered && !editable}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-1 break-all text-[11px] text-[#aaa]">
          引擎识别：{sample.asrText || '(空)'}
        </div>
      </td>

      <td className={CELL}>
        <div className="flex flex-wrap gap-2">
          {allItems.map((it) => (
            <Chip
              key={it.id}
              label={it.label}
              on={selected.includes(it.id)}
              clickable={editable}
              title={(it.keywords || []).join('，')}
              onClick={() => toggleChip(it.id)}
            />
          ))}
        </div>
      </td>

      <td className={CELL + ' w-[108px]'}>
        {ordered && (
          <Button size="mini" onClick={handleEditToggle}>
            {editable ? '取消' : '修改'}
          </Button>
        )}
        <Button size="mini" variant={btnVariant} disabled={btnDisabled || saving} onClick={handleSave}>
          {saving ? '保存中…' : btnText}
        </Button>
        <Button size="mini" variant="danger" onClick={handleDelete}>
          删除
        </Button>
      </td>
    </tr>
  );
}
