const HEAD = 'border border-[#eee] bg-[#f5f5f5] px-2.5 py-2 text-left align-top font-medium text-[#666]';

/**
 * 样本表格（表头固定 5 列：序号 | 原始音频 | 人工校正文本 | 应勾选项 | 操作）
 *
 * 两处共用：样本标注页（整表 + 分页）、本次录音标注卡（只放刚录的一条）。
 */
export default function SampleTable({ children, isEmpty = false, emptyText = '' }) {
  return (
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr>
          <th className={HEAD + ' w-[52px] text-center'}>序号</th>
          <th className={HEAD + ' w-[190px]'}>原始音频</th>
          <th className={HEAD + ' w-[34%]'}>人工校正文本（我听到的）</th>
          <th className={HEAD}>应勾选的 checkbox</th>
          <th className={HEAD + ' w-[108px]'}>操作</th>
        </tr>
      </thead>
      <tbody>
        {isEmpty ? (
          <tr>
            <td colSpan={5} className="border border-[#eee] px-2.5 py-6 text-center text-[#aaa]">
              {emptyText}
            </td>
          </tr>
        ) : (
          children
        )}
      </tbody>
    </table>
  );
}
