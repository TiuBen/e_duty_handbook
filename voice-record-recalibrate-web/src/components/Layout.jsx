/** 通用 UI 原子组件（卡片 / 标题 / 提示 / 按钮） */

export function Card({ className = '', children }) {
  return (
    <div className={'mb-5 rounded-lg border border-line bg-white p-5 ' + className}>{children}</div>
  );
}

export function Hint({ className = '', children }) {
  return <div className={'mt-2 text-xs text-[#999] ' + className}>{children}</div>;
}

export function SectionTag({ children, className = '' }) {
  return (
    <span className={'my-3 block text-[13px] font-semibold text-[#555] ' + className}>{children}</span>
  );
}

export function Bar({ title, sub, children }) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-3">
      <span className="text-[15px] font-semibold">{title}</span>
      {sub ? <span className="min-w-0 flex-1 text-xs text-[#999]">{sub}</span> : <span className="flex-1" />}
      {children}
    </div>
  );
}

const VARIANTS = {
  default: 'border-line bg-white text-[#333] enabled:hover:bg-[#f0f0f0]',
  primary: 'border-accent bg-accent text-white enabled:hover:bg-[#1765cc]',
  danger: 'border-line bg-white text-danger enabled:hover:bg-[#f0f0f0]',
  saved: 'border-ok bg-chipbg text-ok'
};

const SIZES = {
  md: 'rounded px-4 py-[7px] text-[13px]',
  mini: 'my-0.5 block w-full rounded px-2.5 py-1 text-xs'
};

export function Button({ variant = 'default', size = 'md', className = '', children, ...props }) {
  const cls = [
    'border transition',
    VARIANTS[variant] || VARIANTS.default,
    size === 'mini' ? SIZES.mini : SIZES.md,
    'disabled:cursor-default disabled:opacity-45',
    className
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
