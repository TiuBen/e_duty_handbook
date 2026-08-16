import { useAppStore } from '../store/useAppStore.js';
import { SEATS } from '../data/seats.js';

// 席位界面：纯选择器（不显示在班人员）
export default function SeatView() {
  const currentSeat = useAppStore((s) => s.currentSeat);
  const requestSeat = useAppStore((s) => s.requestSeat);

  return (
    <div className="h-full overflow-y-auto p-4 pt-5 pb-24 grid grid-cols-2 gap-3.5 content-start">
      {SEATS.map((s) => {
        const selected = s.id === currentSeat.id;
        return (
          <div
            key={s.id}
            onClick={() => requestSeat(s.id)}
            className="bg-white border rounded-2xl shadow-card flex flex-col items-center gap-3 py-6 px-3.5 cursor-pointer transition"
            style={{
              borderColor: selected ? '#2563EB' : '#E5E7EB',
              boxShadow: selected ? '0 0 0 2px #DBEAFE, 0 1px 2px rgba(15,23,42,.04)' : undefined,
            }}
          >
            <div
              className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md"
              style={{
                background: selected
                  ? 'linear-gradient(135deg,#2563EB,#1D4ED8)'
                  : 'linear-gradient(135deg,#DBEAFE,#2563EB)',
              }}
            >
              {s.name.slice(0, 1)}
            </div>
            <div className="text-base font-bold text-[#0F172A]">{s.name}</div>
            <div className="text-[11px] text-[#64748B] -mt-2">{s.role}</div>
          </div>
        );
      })}
    </div>
  );
}
