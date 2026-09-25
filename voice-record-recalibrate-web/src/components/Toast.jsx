/** 顶部居中 Toast（常驻到被下一条替换，2.6s 后自动隐藏） */
export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed left-1/2 top-4 z-10 -translate-x-1/2 rounded-md bg-[#323232] px-5 py-2.5 text-[13px] text-white">
      {message}
    </div>
  );
}
