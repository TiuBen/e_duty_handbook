import { useEffect, useState } from 'react';

export default function StatusBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  return (
    <div className="relative z-20 h-7 px-7 flex items-center justify-between text-sm font-semibold text-[#0F172A]">
      <span>{hh}:{mm}</span>
      <span className="flex items-center gap-1.5">
        {/* 信号 */}
        <svg viewBox="0 0 18 12" className="w-4 h-3" fill="currentColor">
          <path d="M1 9h2v2H1zM5 7h2v4H5zM9 5h2v6H9zM13 3h2v8h-2zM17 1h2v10h-2z" />
        </svg>
        <span className="text-[11px]">5G</span>
        {/* 电池 */}
        <span className="relative w-6 h-[11px] border border-[#0F172A] rounded-[3px] p-[1px] inline-flex">
          <span className="w-[80%] h-full bg-[#0F172A] rounded-[1px]" />
        </span>
      </span>
    </div>
  );
}
