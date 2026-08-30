/**
 * Vite 配置
 * - 开发端口 5174（避开主项目 5173）
 * - /api 代理到后端 ASR 服务（5300），前端代码零跨域配置
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5300',
        changeOrigin: true,
      },
    },
  },
});
