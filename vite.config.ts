import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        // Cấu hình cách Vite xử lý việc "resolve" (giải quyết) đường dẫn import
        alias: {
            // Đặt bí danh '~' trỏ tới thư mục 'src'
            // Giúp import file gọn hơn, không cần đường dẫn tương đối ../
            // Ví dụ: import Button from '~/components/Button.vue'
            // → tương đương với import Button from 'src/components/Button.vue'
            '~': `${path.resolve(__dirname, 'src')}/`
        }
    },
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
            dts: 'src/autoImports.d.ts'
        }),
        ElementPlus({
            useSource: true, 
        }),
        Components({
            extensions: ['vue', 'md'],
            include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
            resolvers: [
                ElementPlusResolver({
                importStyle: 'sass',
                }),
            ],
            dts: 'src/components.d.ts',
        }),
    ],
})
