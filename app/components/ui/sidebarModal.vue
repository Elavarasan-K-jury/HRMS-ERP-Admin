<template>
    <transition name="slide-fade">
        <div v-if="modelValue" class="fixed inset-0 z-[130] flex justify-end bg-black/40 backdrop-blur-md" @click.self="close">
            <aside class="relative h-full flex flex-col text-white border-l border-white/20
          backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" :class="opaque ? 'bg-[#14161c]' : 'bg-white/10'" :style="sidebarStyle">
                <!-- Header -->
                <header class="flex items-start justify-between px-5 py-4 border-b border-white/10"
                    :class="opaque ? 'bg-[#14161c]' : 'bg-white/10 backdrop-blur-lg'">
                    <div class="min-w-0">
                        <h2 class="text-base font-semibold text-white/90 leading-tight">
                            <slot name="title">{{ title }}</slot>
                        </h2>
                        <div class="mt-0.5 text-xs text-white/50">
                            <slot name="subtitle"></slot>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                        <!-- Fullscreen Toggle Button -->
                        <button @click="toggleFullscreen"
                            class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'">
                            <Icon :name="isFullscreen ? 'lucide:minimize-2' : 'lucide:maximize-2'" class="w-4 h-4" />
                        </button>

                        <button v-if="showClose" @click="close"
                            class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                            <Icon name="lucide:x" class="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-5 glass-scroll">
                    <slot>
                        <p class="text-white/60 text-sm">
                            Add your form or content here.
                        </p>
                    </slot>
                </div>

                <!-- Footer -->
                <footer v-if="showFooter"
                    class="border-t border-white/10 px-5 py-4
            flex justify-end gap-3" :class="opaque ? 'bg-[#14161c]' : 'bg-white/10 backdrop-blur-lg'">
                    <slot name="footer">
                        <button class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition
                text-sm font-medium" @click="close">
                            Cancel
                        </button>
                        <button class="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition
                text-sm font-semibold">
                            Save
                        </button>
                    </slot>
                </footer>
            </aside>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: 'Add New Item' },

    /** Show or hide top right close button */
    showClose: { type: Boolean, default: true },

    /** Width of sidebar — accepts any valid CSS width (e.g. '400px', '40vw', '600px') */
    width: { type: String, default: '580px' },

    /** Show or hide footer */
    showFooter: { type: Boolean, default: true },

    /** Start in fullscreen mode */
    fullscreen: { type: Boolean, default: false },

    /** Solid (non-transparent) background — no glass morphism */
    opaque: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close'])

const isFullscreen = ref(props.fullscreen)

const sidebarStyle = computed(() => ({
    width: isFullscreen.value ? '100vw' : props.width
}))

const close = () => {
    emit('update:modelValue', false)
    emit('close')
    // Reset fullscreen state when closing
    isFullscreen.value = props.fullscreen
}

const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
};
</script>

<style scoped>
/* Slide transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

/* Custom Scrollbar */
.glass-scroll {
    scrollbar-width: thin;
}

.glass-scroll::-webkit-scrollbar {
    width: 8px;
}

.glass-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 9999px;
}

.glass-scroll::-webkit-scrollbar-thumb {
    border-radius: 9999px;
    background: linear-gradient(180deg, #1b6594aa, #392651aa, #9c3c1baa);
}
</style>