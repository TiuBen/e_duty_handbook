import { useAppStore } from "./store/useAppStore.js";
import { WATERMARK } from "./data/seats.js";
import IpadFrame from "./components/IpadFrame.jsx";
import StatusBar from "./components/StatusBar.jsx";
import Watermark from "./components/Watermark.jsx";
import Floats from "./components/Floats.jsx";
import SeatView from "./components/SeatView.jsx";
import CheckListView from "./components/CheckListView.jsx";
import HandoverView from "./components/HandoverView.jsx";
import SeatConfirmModal from "./components/SeatConfirmModal.jsx";

export default function App() {
    const currentView = useAppStore((s) => s.currentView);

    return (
        <div
            className="min-h-screen flex items-center justify-center p-5"
            style={{ background: "radial-gradient(circle at 20% 10%, #1E293B 0%, #0F172A 60%, #020617 100%)" }}
        >
            <IpadFrame>
                <StatusBar />
                {/* 页面内容 */}
                <div className="absolute inset-x-0 top-7 bottom-0">
                    {/* 水印：最上层 + 无交互 */}
                    <Watermark text={WATERMARK[currentView]} />
                    {/* 3 个界面 */}
                    <div className={`absolute inset-0 ${currentView === "seats" ? "" : "hidden"}`}>
                        <SeatView />
                    </div>
                    <div className={`absolute inset-0 ${currentView === "checklist" ? "" : "hidden"}`}>
                        <CheckListView />
                    </div>
                    <div className={`absolute inset-0 ${currentView === "handover" ? "" : "hidden"}`}>
                        <HandoverView />
                    </div>
                </div>
                {/* 悬浮框 */}
                <Floats />
                {/* 席位确认弹窗 */}
                <SeatConfirmModal />
            </IpadFrame>
        </div>
    );
}
