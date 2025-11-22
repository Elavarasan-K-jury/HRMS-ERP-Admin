// app/stores/head.store.js
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('Theme', {
    state: () => ({
        preloader: true,
        sidebar: true,
    }),
    actions: {
        toggleSidebar() {
            this.sidebar = !this.sidebar
        }
    }
})
