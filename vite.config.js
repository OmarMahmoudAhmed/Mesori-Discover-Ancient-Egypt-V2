import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*
 * vite.config.js
 * إعدادات أداة البناء Vite
 * -------------------------------------------------
 * Vite هي أداة بناء حديثة وسريعة جداً تستخدم
 * ES Modules بدلاً من Webpack القديم.
 * - npm run dev    → وضع التطوير مع HMR (تحديث فوري)
 * - npm run build  → بناء الإنتاج (مضغوط ومُحسَّن)
 */
export default defineConfig({
  plugins: [react()], // دعم JSX وميزات React الحديثة
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
});
