export default function IpadFrame({ children }) {
  return (
    <div
      data-ipad
      className="relative overflow-hidden bg-[#F2F4F7] grid-paper"
      style={{
        width: 'min(820px, 96vw)',
        aspectRatio: '3 / 4',
        maxHeight: '94vh',
        borderRadius: 36,
        boxShadow:
          '0 0 0 11px #1F2937, 0 0 0 13px #111827, 0 40px 80px rgba(0,0,0,.55)',
      }}
    >
      {/* Face ID 区域 */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[90px] h-[22px] rounded-full border border-black/5 z-30" />
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0F172A] z-30" />
      {children}
      {/* Home Indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[120px] h-1 rounded-full bg-[#64748B] opacity-45 z-30" />
    </div>
  );
}
