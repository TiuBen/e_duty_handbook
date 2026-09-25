/**
 * 清单项 chip
 * @param on        是否选中（绿色）
 * @param clickable 是否可点（false = 只读，无 hover 强调）
 */
export default function Chip({ label, on = false, clickable = false, title, onClick }) {
  const cls = [
    'inline-block rounded-full border px-3.5 py-[5px] text-[13px] transition',
    on ? 'border-ok bg-chipbg font-semibold text-ok' : 'border-line bg-white text-[#999]',
    clickable ? 'cursor-pointer select-none hover:border-accent hover:text-accent' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span title={title} onClick={clickable ? onClick : undefined} className={cls}>
      {label}
    </span>
  );
}
