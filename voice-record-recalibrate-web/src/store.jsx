import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, resolveAudioUrl } from './api';

/**
 * 全局状态：引擎状态 / 规则 / 样本 / Toast
 *
 * rev（版本号）用于「样本数据变更后让样本行重挂载」：
 * 保存标注、删除样本、重新拉取列表都会 bump rev，
 * 样本行以 `${id}#${rev}` 作 key，重挂载后回到「已标注 / 已保存 ✓」态
 * —— 与原 admin 页保存后整表重渲染的行为一致。
 */
const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState(false);
  const [rules, setRules] = useState(null);
  const [samples, setSamples] = useState([]);
  const [rev, setRev] = useState(0);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg || '');
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2600);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /** 所有清单项（来自规则），供"应勾选"列渲染 chips */
  const allItems = useMemo(() => {
    const out = [];
    (rules?.groups || []).forEach((g) => (g.items || []).forEach((it) => out.push(it)));
    return out;
  }, [rules]);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await api.status());
      setStatusError(false);
    } catch {
      setStatus(null);
      setStatusError(true);
    }
  }, []);

  const reloadRules = useCallback(async () => {
    const r = await api.getRules();
    setRules(r);
    return r;
  }, []);

  const reloadSamples = useCallback(async () => {
    try {
      const j = await api.getSamples();
      const list = j.samples || [];
      setSamples(list);
      setRev((v) => v + 1);
      return list;
    } catch (e) {
      toast('样本列表加载失败：' + e.message);
      return [];
    }
  }, [toast]);

  /** 保存标注后同步本地：更新样本对象 + bump rev（触发相关行重挂载） */
  const applySamplePatch = useCallback((id, vals) => {
    setSamples((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], ...vals };
      return next;
    });
    setRev((v) => v + 1);
  }, []);

  const removeSampleLocal = useCallback((id) => {
    setSamples((prev) => prev.filter((s) => s.id !== id));
    setRev((v) => v + 1);
  }, []);

  const value = {
    status,
    statusError,
    loadStatus,
    rules,
    setRules,
    reloadRules,
    allItems,
    samples,
    rev,
    reloadSamples,
    applySamplePatch,
    removeSampleLocal,
    toast,
    toastMsg,
    resolveAudioUrl
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp 必须在 <AppProvider> 内使用');
  return ctx;
}
