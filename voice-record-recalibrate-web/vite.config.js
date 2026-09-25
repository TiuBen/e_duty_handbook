import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * 后端地址：默认本机 5184（voice-record-recalibrate-server）。
 * 需要指向别的机器时，启动前设置环境变量 VITE_API_TARGET，例如：
 *   VITE_API_TARGET=http://192.168.1.20:5184 npm run dev
 */
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:5184';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5200,
    strictPort: true,
    // 开发期把 /api 与 /uploads 反代到后端，前端代码里始终用相对路径
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
      '/uploads': { target: API_TARGET, changeOrigin: true }
    }
  },
  preview: {
    port: 5200,
    strictPort: true
  }
});
