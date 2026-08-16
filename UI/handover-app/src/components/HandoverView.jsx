import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore.js";

// ================= 语音确认语句（按住录音） =================
function VoiceSentence({ sentence, gIdx }) {
    const setGroupError = useAppStore((s) => s.setGroupError);
    const [status, setStatus] = useState("idle"); // idle | recording | ok | fail
    const timer = useRef(null);

    function start() {
        clearTimeout(timer.current);
        setStatus("recording");
        timer.current = setTimeout(() => {
            // 模拟识别：75% 匹配
            const ok = Math.random() > 0.25;
            setStatus(ok ? "ok" : "fail");
            setGroupError(gIdx, !ok);
            timer.current = setTimeout(() => setStatus("idle"), 4000);
        }, 1500);
    }
    function stop() {
        clearTimeout(timer.current);
        if (status === "recording") setStatus("idle");
    }
    useEffect(() => () => clearTimeout(timer.current), []);

    const bg =
        status === "ok"
            ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]"
            : status === "fail"
            ? "bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]"
            : status === "recording"
            ? "bg-[#EBF2FF] border-[#BFDBFE] text-[#2563EB] animate-recPulse"
            : "bg-[#F5F9FF] border-[#D6E6FF] text-[#2563EB]";

    const hint =
        status === "recording"
            ? "录音中…松开对比"
            : status === "ok"
            ? "✓ 已确认"
            : status === "fail"
            ? "✗ 不相符"
            : "按住录音";

    return (
        <div
            onMouseDown={start}
            onMouseUp={stop}
            onMouseLeave={stop}
            onTouchStart={start}
            onTouchEnd={stop}
            className={`mt-3 px-3 py-2.5 rounded-[10px] border text-xs leading-relaxed cursor-pointer select-none flex items-center gap-2.5 transition ${bg}`}
        >
            <span className="flex-1">{sentence || "（暂无语音确认项）"}</span>
            <span
                className={`text-[10px] whitespace-nowrap pl-2 border-l ${
                    status === "recording"
                        ? "border-[#2563EB] text-[#2563EB]"
                        : status === "ok"
                        ? "border-[#BBF7D0] text-[#16A34A]"
                        : status === "fail"
                        ? "border-[#FECACA] text-[#DC2626]"
                        : "border-[#D6E6FF] text-[#9CA3AF]"
                }`}
            >
                {hint}
            </span>
        </div>
    );
}

// ================= 单个大项分组 =================
function HandoverGroup({ gIdx, group }) {
    const toggleChip = useAppStore((s) => s.toggleChip);
    const toggleConfirm = useAppStore((s) => s.toggleConfirm);
    const buildSentence = useAppStore((s) => s.buildSentence);
    const sentence = buildSentence(gIdx);

    // 选项 chip 的选中状态
    const isSel = (c, v) => c.selected.includes(v);

    return (
        <div
            className={`flex flex-row shrink-0 bg-white rounded-2xl overflow-hidden shadow-card border transition-colors ${
                group.error ? "border-[#FCD34D]" : "border-[#E5E7EB]"
            }`}
        >
            {/* 标题：竖排在最左（从左到右 lr），无底色，高度由内容撑开（不写死） */}
            <div
                className="writing-vertical px-[8px] py-[18px] text-base font-semibold tracking-[.15em] text-[#334155] shrink-0 border-r border-dashed border-[#E5E7EB] flex items-center justify-center"
                style={{ minWidth: 42, letterSpacing: "4px" }}
            >
                {group.title}
            </div>
            {/* 左侧内容 */}
            <div className="flex-1 p-3.5 pb-3 min-w-0 inline-flex">
                {group.comps.length === 0 && <div className="text-xs text-[#9CA3AF] py-1">（暂无选项）</div>}
                {group.comps.map((c, ci) => {
                    // ---- text 数字数组：数字单选（如道面状况代码 0-5，类型标签编辑时可见） ----
                    if (c.type === "text" && typeof c.items[0] === "number") {
                        return (
                            <div key={ci} className="mb-3 last:mb-0">
                                <div className="mb-1.5">
                                    <span className="text-[11px] text-[#6B7280]">道面状况代码</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {c.items.map((n) => (
                                        <Chip
                                            key={n}
                                            sel={isSel(c, String(n))}
                                            onClick={() => toggleChip(gIdx, ci, String(n))}
                                            error={group.error}
                                        >
                                            {n}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        );
                    }
                    // ---- text 字符串：纯标签提示行（无确认按钮） ----
                    if (c.type === "text") {
                        return (
                            <div key={ci} className="mb-3 last:mb-0">
                                <div className="mb-1.5">
                                    <span className="text-[11px] text-[#6B7280]">{c.items[0]}</span>
                                </div>
                            </div>
                        );
                    }
                    // ---- single / multi（类型标签编辑时可见，界面只显示选项） ----
                    return (
                        <div key={ci} className="mb-3 last:mb-0">
                            <div className="flex flex-wrap gap-1.5">
                                {c.items.map((v) => (
                                    <Chip
                                        key={v}
                                        sel={isSel(c, v)}
                                        onClick={() => toggleChip(gIdx, ci, v)}
                                        error={group.error}
                                    >
                                        {v}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {sentence && <VoiceSentence sentence={sentence} gIdx={gIdx} />}
            </div>
        </div>
    );
}

function Chip({ sel, onClick, error, children }) {
    return (
        <span
            onClick={onClick}
            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[13px] cursor-pointer select-none transition active:scale-95 border ${
                error ? "text-[#B45309] animate-amberBlink" : "text-[#4B5563]"
            } ${
                sel
                    ? error
                        ? "bg-[#FEF3C7] border-[#F59E0B]"
                        : "bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]"
                    : "bg-[#F7F8FA] border-[#E5E7EB]"
            }`}
        >
            {children}
        </span>
    );
}

// ================= 交接班视图 =================
export default function HandoverView() {
    const handover = useAppStore((s) => s.handover);
    return (
        <div className="h-full overflow-y-auto p-4 pb-24 flex flex-col gap-2">
            {handover.map((g, i) => (
                <HandoverGroup key={i} gIdx={i} group={g} />
            ))}{" "}
        </div>
    );
}
