const SEGMENTS = [
  { key: 'voice', label: '语音识别' },
  { key: 'samples', label: '样本标注' },
  { key: 'dict', label: '纠错词典' }
];

/** 顶部三段式 Segment 切换 */
export default function SegmentBar({ value, onChange }) {
  return (
    <div className="mx-auto mb-[22px] flex w-fit justify-center gap-1 rounded-[10px] bg-[#ececec] p-1">
      {SEGMENTS.map((s) => {
        const active = value === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onChange(s.key)}
            className={
              'rounded-[7px] border-none px-[30px] py-2 text-sm transition ' +
              (active
                ? 'bg-white font-semibold text-accent shadow-[0_1px_3px_rgba(0,0,0,.12)]'
                : 'bg-transparent text-[#555] hover:bg-white/60')
            }
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
