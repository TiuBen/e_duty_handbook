import { Button } from './Layout';

const PAGE_SIZES = [5, 10, 20, 50];

/** 分页控件：每页条数 + 上一页 / 下一页 */
export default function Pager({ total, page, pageCount, pageSize, onPageSize, onPrev, onNext }) {
  const info = total > 0 ? `共 ${total} 条，第 ${page}/${pageCount} 页` : '共 0 条';
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs text-[#999]">{info}</span>
      <span className="flex items-center gap-2 text-[13px] text-[#666]">
        每页
        <select
          className="rounded border border-line px-1.5 py-1 text-[13px]"
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value) || 10)}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        条
        <Button disabled={page <= 1} onClick={onPrev}>
          上一页
        </Button>
        <Button disabled={page >= pageCount} onClick={onNext}>
          下一页
        </Button>
      </span>
    </div>
  );
}
