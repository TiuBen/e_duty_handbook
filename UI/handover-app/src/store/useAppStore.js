import { create } from "zustand";
import { SEATS } from "../data/seats.js";
import { HANDOVER_GROUPS } from "../data/handover.js";

// 初始化交接班状态：每个分组的每个 comp 一个 selected 数组
function initHandover() {
    return HANDOVER_GROUPS.map((g) => ({
        title: g.title,
        error: false,
        comps: g.comp.map((c) => ({
            type: c.type,
            items: c.items,
            selected: [],
        })),
    }));
}

export const useAppStore = create((set, get) => ({
    // ---- 导航 ----
    currentView: "handover", // seats | checklist | handover
    snap: "right", // 悬浮框吸附方向 right | left | top | bottom

    goView: (viewId) => set({ currentView: viewId }),
    setSnap: (snap) => set({ snap }),

    // ---- 席位 ----
    currentSeat: SEATS[0],
    pendingSeatId: null,

    requestSeat: (id) => set({ pendingSeatId: id }),
    confirmSeat: () => {
        const { pendingSeatId } = get();
        if (!pendingSeatId) return;
        const seat = SEATS.find((s) => s.id === pendingSeatId) || SEATS[0];
        set({ currentSeat: seat, pendingSeatId: null });
    },
    cancelSeat: () => set({ pendingSeatId: null }),

    // ---- 交接班 ----
    handover: initHandover(),

    // 切换某个选项组内某个选项
    toggleChip: (gIdx, cIdx, value) => {
        set((state) => {
            const handover = state.handover.map((g, gi) => {
                if (gi !== gIdx) return g;
                const comps = g.comps.map((c, ci) => {
                    if (ci !== cIdx) return c;
                    let selected;
                    if (c.type === "single") {
                        selected = [value];
                    } else {
                        selected = c.selected.includes(value)
                            ? c.selected.filter((v) => v !== value)
                            : [...c.selected, value];
                    }
                    return { ...c, selected };
                });
                return { ...g, comps };
            });
            return { handover };
        });
    },

    // text 标签行（"确认无误/不符"）
    toggleConfirm: (gIdx, cIdx, value) => {
        set((state) => {
            const handover = state.handover.map((g, gi) => {
                if (gi !== gIdx) return g;
                const comps = g.comps.map((c, ci) => {
                    if (ci !== cIdx) return c;
                    return { ...c, selected: [value] };
                });
                return { ...g, comps };
            });
            return { handover };
        });
    },

    // 标记分组错误（语音不相符时）
    setGroupError: (gIdx, error) => {
        set((state) => ({
            handover: state.handover.map((g, gi) => (gi === gIdx ? { ...g, error } : g)),
        }));
    },

    // 拼接某分组的语音确认语句
    buildSentence: (gIdx) => {
        const g = get().handover[gIdx];
        if (!g) return "";
        const parts = [];
        g.comps.forEach((c) => {
            if (c.type === "text" && typeof c.items[0] === "string") return; // 跳过标签行
            if (c.selected.length) parts.push(c.selected.join("、"));
        });
        return parts.length ? `现在是${parts.join("，")}` : "";
    },
}));
