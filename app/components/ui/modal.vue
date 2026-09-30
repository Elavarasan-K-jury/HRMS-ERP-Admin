<template>
    <transition name="fade-scale">
        <div v-if="modelValue" class="fixed inset-0 z-[120] flex items-center justify-center backdrop-blur-md"
            :style="{ zIndex: zIndex }" @click.self="close">
            <div class="relative w-full rounded-2xl border border-white/15
               bg-white/10 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" :class="panelClass" :style="panelStyle">
                <!-- Header -->
                <header v-if="showHeader" class="flex items-center justify-between px-5 py-4 border-b border-white/10
                 bg-white/5 backdrop-blur-md rounded-t-2xl">
                    <h2 class="text-lg font-semibold">
                        <slot name="title">{{ title }}</slot>
                    </h2>

                    <button v-if="showClose" @click="close" class="text-white/70 hover:text-white transition-colors"
                        aria-label="Close">
                        <Icon name="lucide:x" class="w-5 h-5" />
                    </button>
                </header>

                <!-- Content -->
                <section class="flex-1 overflow-y-auto min-h-0 px-6 py-5 glass-scroll">
                    <slot>
                        <p class="text-white/70 text-sm">Place your content here.</p>
                    </slot>
                </section>

                <!-- Footer -->
                <footer v-if="showFooter"
                    class="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 rounded-b-2xl">
                    <slot name="footer">
                        <button class="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition
                     text-sm font-medium" @click="close">
                            Cancel
                        </button>
                        <button class="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition
                     text-sm font-semibold">
                            Confirm
                        </button>
                    </slot>
                </footer>
            </div>
        </div>
    </transition>
</template>

<script setup>
const props = defineProps({
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: 'Modal Title' },

    /** size presets (used only when width is not provided) */
    size: { type: String, default: 'md' }, // sm | md | lg

    /** explicit width; accepts number (px) or any CSS length (e.g., '720px', '60rem', '70vw') */
    width: { type: [Number, String], default: '' },

    /** optional max height (e.g., '92vh'); when set, the panel becomes a flex
     *  column and the content section scrolls internally so tall content never
     *  pushes the panel outside the viewport */
    maxHeight: { type: String, default: '' },

    showHeader: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true },
    showClose: { type: Boolean, default: true },
    zIndex: { type: Number, default: 120 },
})

const emit = defineEmits(['update:modelValue'])

const close = () => emit('update:modelValue', false)

const resolvedWidth = computed(() => {
    if (props.width === '' || props.width === null || props.width === undefined) return ''
    return typeof props.width === 'number' ? `${props.width}px` : props.width
})

/** class only applies when width is not provided */
const panelClass = computed(() => {
    const constrained = props.maxHeight ? 'flex flex-col' : ''
    if (resolvedWidth.value) return `max-w-[95vw] ${constrained}`.trim()
    const preset = {
        sm: 'max-w-[420px]',
        md: 'max-w-[600px]',
        lg: 'max-w-[820px]',
    }[props.size] || 'max-w-[600px]'
    return `${preset} ${constrained}`.trim()
})

/** inline style takes priority if width is provided */
const panelStyle = computed(() => {
    const style = {}
    if (resolvedWidth.value) {
        style.width = resolvedWidth.value
        style.maxWidth = '95vw'
    }
    if (props.maxHeight) style.maxHeight = props.maxHeight
    return style
});
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity 0.35s ease, transform 0.35s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
}

/* Glass scroll */
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
