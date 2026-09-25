import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './store';
import SegmentBar from './components/SegmentBar';
import Toast from './components/Toast';
import VoicePane from './pages/VoicePane';
import SamplesPane from './pages/SamplesPane';
import DictPane from './pages/DictPane';

function Shell() {
  const { toastMsg, reloadRules, reloadSamples } = useApp();
  const [seg, setSeg] = useState('voice');

  // 启动即拉取规则与样本（与原 admin 页 loadRules().then(loadSamples) 一致）
  useEffect(() => {
    reloadRules().catch((e) => console.error('规则加载失败', e));
    reloadSamples();
  }, [reloadRules, reloadSamples]);

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-6">
      <h1 className="m-0 mb-1 text-xl">语音识别规则微调</h1>
      <div className="mb-5 text-[#777]">
        配置"识别文本 → 清单勾选项"的关键词映射，保存后立即对 App 生效，无需重启服务。
      </div>

      <SegmentBar value={seg} onChange={setSeg} />

      {/* 三个 pane 始终挂载，只切换显示 —— 与原 admin 页一致：切回来时状态还在 */}
      <div className={seg === 'voice' ? '' : 'hidden'}>
        <VoicePane />
      </div>
      <div className={seg === 'samples' ? '' : 'hidden'}>
        <SamplesPane />
      </div>
      <div className={seg === 'dict' ? '' : 'hidden'}>
        <DictPane />
      </div>

      <Toast message={toastMsg} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
