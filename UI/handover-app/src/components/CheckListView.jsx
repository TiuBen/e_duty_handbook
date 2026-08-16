import { TEMPLATE_GROUPS } from '../data/templates.js';

// 检查单界面：模板选择（3 列小方框网格）
export default function CheckListView() {
  return (
    <div className="h-full overflow-y-auto p-4 pt-4 pb-24 flex flex-col gap-3.5">
      {TEMPLATE_GROUPS.map((g) => (
        <div key={g.id} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-card p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-[#64748B]">{g.label}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
              {g.items.length} 项
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {g.items.map((it) => (
              <div
                key={it.id}
                onClick={(e) => {
                  // 假装选中：短暂高亮
                  e.currentTarget.style.background = '#DBEAFE';
                  e.currentTarget.style.borderColor = '#2563EB';
                  setTimeout(() => {
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.borderColor = '';
                  }, 600);
                }}
                className="flex flex-col items-center gap-2 border border-[#E5E7EB] rounded-xl py-3.5 px-2 bg-white cursor-pointer transition hover:border-[#2563EB] hover:bg-[#F7F8FA] active:scale-[.97] text-center"
              >
                <div className="w-[34px] h-[34px] rounded-[10px] bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center text-lg font-semibold">
                  {it.icon}
                </div>
                <div className="text-xs font-semibold text-[#1F2937] leading-[1.35]"
                     style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {it.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
