<template>
    <div class="fixed top-0 left-0 h-full z-[9999] pointer-events-none">
        <!-- Slide-in Sidebar -->
        <div :class="[
            'absolute top-0 left-0 h-full w-[230px] bg-black/40 backdrop-blur-xl pointer-events-auto',
            'border-r border-white/20 shadow-xl overflow-y-auto transition-transform duration-300',
            open ? 'translate-x-0' : '-translate-x-full'
        ]">
            <div class="p-4 text-white">
                <h2 class="text-sm font-semibold mb-3 opacity-80">Theme Colors</h2>

                <div v-for="group in theme.bgColors" :key="group.label" class="mb-4">
                    <p class="text-xs font-medium mb-1 opacity-70">{{ group.label }}</p>

                    <div class="grid grid-cols-5 gap-1">
                        <button v-for="shade in group.shades" :key="shade.label" @click="select(group, shade)"
                            class="h-7 rounded cursor-pointer border border-white/10"
                            :style="{ backgroundColor: shade.color }" :class="{
                                'ring-2 ring-white ring-offset-1 ring-offset-black/20':
                                    theme.bgColor === shade.color
                            }" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Trigger Button -->
        <button @click="toggle" :class="[
            'absolute top-1/2 -translate-y-1/2 h-16 flex items-center justify-center',
            'bg-black/40 hover:bg-black/60 transition backdrop-blur rounded-r-xl',
            'w-10 pointer-events-auto',
            open ? 'translate-x-[229px]' : 'translate-x-0'
        ]">
            <Icon name="ion:settings-outline" class="text-2xl text-white" />
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useThemeStore } from '@/stores/theme.store'

const open = ref(false)
const theme = useThemeStore()

const toggle = () => { open.value = !open.value }

const select = (color, shade) => {
    theme.updateColor(color, shade)
};
</script>
