// 页面水印：淡色斜体大字，最上层 + pointer-events:none（无交互）
export default function Watermark({ text }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] z-[60] select-none pointer-events-none whitespace-nowrap"
      style={{
        fontSize: 96,
        fontWeight: 800,
        letterSpacing: 12,
        color: 'rgba(15,23,42,.06)',
      }}
    >
      {text}
    </div>
  );
}
