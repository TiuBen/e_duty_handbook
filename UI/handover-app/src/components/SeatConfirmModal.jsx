import { useAppStore } from '../store/useAppStore.js';
import { SEATS } from '../data/seats.js';

// 席位切换确认弹窗：确认后不自动跳转
export default function SeatConfirmModal() {
  const pendingSeatId = useAppStore((s) => s.pendingSeatId);
  const confirmSeat = useAppStore((s) => s.confirmSeat);
  const cancelSeat = useAppStore((s) => s.cancelSeat);

  const seat = SEATS.find((s) => s.id === pendingSeatId) || null;
  const open = !!seat;

  return (
    <div
      className={`absolute inset-0 z-[70] items-center justify-center p-6 backdrop-blur-[2px] bg-[rgba(15,23,42,.5)] ${open ? 'flex animate-fade' : 'hidden'}`}
      onClick={cancelSeat}
    >
      <div
        className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_30px_60px_rgba(15,23,42,.25),0_0_0_1px_rgba(15,23,42,.04)] overflow-hidden animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 border-b border-[#E5E7EB]">
          <div className="text-lg font-bold text-[#0F172A]">⚠ 切换席位确认</div>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-[#334155] leading-relaxed mb-4">确认切换本设备为</p>
          <div className="flex items-center gap-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl p-3.5">
            <span className="text-[11px] text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full">席位</span>
            <div>
              <div className="text-xl font-bold text-[#0F172A]">{seat?.name}</div>
              <div className="text-xs text-[#6B7280] mt-0.5">{seat?.role}</div>
            </div>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed mt-4">
            确认后不会自动跳转，请手动点击悬浮框进入对应界面。
          </p>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#E5E7EB]">
          <button onClick={cancelSeat}
                  className="px-4 py-2 rounded-full text-[13px] font-medium text-[#4B5563] hover:bg-[#F7F8FA] transition">
            取消
          </button>
          <button onClick={confirmSeat}
                  className="px-4 py-2 rounded-full text-[13px] font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] transition">
            确认切换
          </button>
        </div>
      </div>
    </div>
  );
}
