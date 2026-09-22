/// <reference types="vite/client" />
/*
 * 测试里用 `import xxx from './xxx.vue?raw'` 读 SFC 源码做文本断言，
 * `*?raw` 这类后缀导入的类型已由 vite/client 提供（见 node_modules/vite/client.d.ts），
 * 这里直接引用，无需重复声明。
 */
