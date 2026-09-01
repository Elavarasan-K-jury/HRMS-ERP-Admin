<template>
    <div class="relative" ref="wrapperRef">
        <button type="button" class="filter-trigger" :disabled="disabled" @click="open = !open">
            <span class="inline-flex items-center gap-1.5">
                <Icon name="ion:options-outline" class="text-base text-white/50" />
                <span class="truncate">{{ triggerLabel }}</span>
            </span>
            <span class="ml-2 inline-flex items-center gap-1.5">
                <span v-if="selectedCount" class="count-badge">{{ selectedCount }}</span>
                <Icon name="ion:chevron-down" class="text-sm text-white/50 transition-transform"
                    :class="{ 'rotate-180': open }" />
            </span>
        </button>

        <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 -translate-y-1 scale-95">
            <div v-if="open" class="filter-panel">
                <div class="border-b border-white/10 px-3 py-2">
                    <div class="relative">
                        <Icon name="ion:search" class="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-white/40" />
                        <input ref="queryRef" v-model="query" type="text" placeholder="Search..."
                            class="w-full rounded-md border border-white/15 bg-black/20 py-1.5 pl-7 pr-2 text-xs text-white/90 placeholder-white/40 outline-none focus:border-emerald-300/60" />
                    </div>
                </div>

                <div class="max-h-64 overflow-y-auto p-1.5">
                    <label class="filter-option filter-option-all">
                        <input type="checkbox" :checked="allChecked" :indeterminate.prop="someChecked"
                            @change="toggleAll" />
                        <span class="font-medium text-white/90">Select All</span>
                        <span v-if="someChecked && !allChecked" class="ml-1 text-[10px] text-white/40">({{ selectedCount }})</span>
                    </label>
                    <div v-if="query" class="my-1 h-px bg-white/10" />
                    <label v-for="opt in filteredOptions" :key="opt.value" class="filter-option">
                        <input type="checkbox" :checked="isSelected(opt.value)" @change="toggleOption(opt.value)" />
                        <span class="truncate">{{ opt.label }}</span>
                    </label>
                    <p v-if="!filteredOptions.length" class="px-3 py-4 text-center text-xs text-white/40">No options found.</p>
                </div>

                <div class="flex items-center justify-between border-t border-white/10 px-3 py-2">
                    <button type="button" class="text-xs text-white/50 transition hover:text-white/90"
                        :disabled="!selectedCount" @click="clear">Clear</button>
                    <span class="text-[10px] uppercase tracking-wider text-white/40">{{ selectedCount }} selected</span>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
    title: { type: String, default: 'Filter' },
    modelValue: { type: Array, default: () => [] },
    options: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
const wrapperRef = ref(null)
const queryRef = ref(null)

const selected = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

const selectedCount = computed(() => selected.value.length)

const allChecked = computed(() =>
    filteredOptions.value.length > 0 &&
    filteredOptions.value.every(o => selected.value.includes(o.value)))

const someChecked = computed(() =>
    filteredOptions.value.some(o => selected.value.includes(o.value)))

const filteredOptions = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return props.options
    return props.options.filter(o => o.label.toLowerCase().includes(q))
})

const triggerLabel = computed(() => {
    if (!selectedCount.value) return 'All ' + props.title
    if (allChecked.value) return 'All ' + props.title
    return `${props.title} (${selectedCount.value})`
})

const isSelected = (value) => selected.value.includes(value)

const toggleOption = (value) => {
    const next = selected.value.includes(value)
        ? selected.value.filter(v => v !== value)
        : [...selected.value, value]
    selected.value = next
}

const toggleAll = (e) => {
    selected.value = e.target.checked
        ? [...new Set([...selected.value, ...filteredOptions.value.map(o => o.value)])]
        : [...new Set(selected.value)].filter(v => !filteredOptions.value.some(o => o.value === v))
}

const clear = () => {
    selected.value = []
}

const onClickOutside = (e) => {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
        open.value = false
        query.value = ''
    }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.filter-trigger { @apply inline-flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-black/20 py-2 pl-3 pr-2.5 text-sm text-white/80 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50; min-width: 170px; max-width: 220px; }
.count-badge { @apply inline-flex min-w-[18px] items-center justify-center rounded-full bg-emerald-300/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300; }
.filter-panel { @apply absolute left-0 z-30 mt-1.5 w-64 rounded-xl border border-white/15 bg-neutral-900/95 shadow-2xl backdrop-blur-xl; }
.filter-option { @apply flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/10 hover:text-white/95; }
.filter-option-all { @apply border-b border-white/10; }
.filter-option input[type="checkbox"] { @apply h-3.5 w-3.5 shrink-0 cursor-pointer accent-emerald-300; }
</style>