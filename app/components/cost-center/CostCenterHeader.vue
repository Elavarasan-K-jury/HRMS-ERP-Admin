<template>
    <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-5 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0">
            <span class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold uppercase
                bg-emerald-400/25 text-emerald-200 ring-1 ring-emerald-300/40">
                {{ initials }}
            </span>
            <div class="min-w-0">
                <div class="flex items-center gap-2">
                    <h2 class="text-lg font-semibold text-white/90 truncate">{{ costCenter?.name || 'Select a cost center' }}</h2>
                    <span class="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/10 text-white/60 border border-white/10">{{ costCenter?.code || '' }}</span>
                </div>
                <p class="text-xs text-white/55 mt-0.5">
                    {{ costCenter?.employee_count || 0 }} employee(s) assigned
                    <template v-if="costCenter?.description">&nbsp;•&nbsp;{{ costCenter.description }}</template>
                </p>
            </div>
        </div>

        <div class="relative flex-shrink-0">
            <button type="button" class="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70" @click="toggleMenu">
                <Icon name="lucide:more-vertical" class="w-5 h-5" />
            </button>

            <transition name="fade-scale">
                <div v-if="menuOpen" class="absolute right-0 top-11 z-40 w-44 rounded-xl border border-white/15 bg-[#14161c] shadow-2xl overflow-hidden">
                    <button type="button" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 transition-colors text-left"
                        @click="menuAction('edit')">
                        <Icon name="lucide:edit-3" class="w-4 h-4 text-emerald-300" /> Edit
                    </button>
                    <button type="button" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                        @click="menuAction('delete')">
                        <Icon name="lucide:trash-2" class="w-4 h-4" /> Delete
                    </button>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    costCenter: { type: Object, default: null },
})

const emit = defineEmits(['edit', 'delete'])

const menuOpen = ref(false)

const toggleMenu = () => { menuOpen.value = !menuOpen.value }

const menuAction = (action) => {
    menuOpen.value = false
    if (action === 'edit') emit('edit')
    else if (action === 'delete') emit('delete')
}

const initials = computed(() => {
    const name = props.costCenter?.name
    if (!name) return 'CC'
    return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
})
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.96) translateY(-4px);
}
</style>