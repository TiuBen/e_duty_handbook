import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore.js';
import { TABS } from '../data/seats.js';

// 悬浮框：贴边吸附的标签条，显示非当前界面的 2 个标签
export default function Floats() {
  const currentView = useAppStore((s) => s.currentView);
  const goView = useAppStore((s) => s.goView);
  const snap = useAppStore((s) => s.snap);
  const setSnap = useAppStore((s) => s.setSnap);

  const others = TABS.filter((t) => t.id !== currentView);
  const floatsRef = useRef(null);
  const drag = useRef(null);
  const [dragging, setDragging] = useState(false);

  // 吸附定位
  const snapPos = {
    right: { right: 0, top: '50%', transform: 'translateY(-50%)', flexDirection: 'column' },
    left: { left: 0, top: '50%', transform: 'translateY(-50%)', flexDirection: 'column' },
    top: { top: 0, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row' },
    bottom: { bottom: 0, left: '50%', transform: 'translateX(-50%)', flexDirection: 'row' },
  }[snap];

  // 标签圆角方向
  const radius = {
    right: '24px 0 0 24px',
    left: '0 24px 24px 0',
    top: '24px 24px 0 0',
    bottom: '0 0 24px 24px',
  }[snap];

  function handleMouseDown(e) {
    if (e.target.closest('button')) return;
    const ipad = e.currentTarget.closest('[data-ipad]').getBoundingClientRect();
    const rect = e.currentTarget.getBoundingClientRect();
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      offL: rect.left - ipad.left,
      offT: rect.top - ipad.top,
      ipad,
    };
    setDragging(true);
    e.preventDefault();
  }

  useEffect(() => {
    function onMove(e) {
      if (!drag.current) return;
      const { startX, startY, offL, offT } = drag.current;
      const el = floatsRef.current;
      el.style.left = `${offL + e.clientX - startX}px`;
      el.style.top = `${offT + e.clientY - startY}px`;
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.transform = 'none';
    }
    function onUp() {
      if (!drag.current) return;
      setDragging(false);
      const el = floatsRef.current;
      const ipad = drag.current.ipad;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dRight = ipad.right - cx;
      const dLeft = cx - ipad.left;
      const dTop = cy - ipad.top;
      const dBottom = ipad.bottom - cy;
      const horiz = Math.min(dLeft, dRight);
      const vert = Math.min(dTop, dBottom);
      let s;
      if (horiz < vert) s = dLeft < dRight ? 'left' : 'right';
      else s = dTop < dBottom ? 'top' : 'bottom';
      setSnap(s);
      drag.current = null;
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [setSnap]);

  return (
    <div
      ref={floatsRef}
      onMouseDown={handleMouseDown}
      className="absolute z-40 flex items-center gap-1.5 p-2 cursor-grab select-none rounded-[28px]"
      style={{
        ...snapPos,
        background: 'rgba(255,255,255,.92)',
        border: '1px solid #E5E7EB',
        boxShadow: '0 8px 24px rgba(15,23,42,.12)',
        backdropFilter: 'blur(8px)',
        cursor: dragging ? 'grabbing' : 'grab',
      }}
    >
      {others.map((t) => (
        <button
          key={t.id}
          onClick={() => goView(t.id)}
          title={t.label}
          className="flex items-center justify-center text-[13px] font-semibold text-[#4B5563] hover:text-[#2563EB] hover:bg-white transition"
          style={{
            width: 54,
            height: 48,
            borderRadius: radius,
            background: 'rgba(255,255,255,.9)',
            border: '1px solid transparent',
          }}
        >
          {t.short}
        </button>
      ))}
    </div>
  );
}
