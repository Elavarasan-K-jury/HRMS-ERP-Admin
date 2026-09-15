<template>
    <div class="relative" ref="rootEl">
        <label class="block text-sm text-white/85 mb-1.5">{{ label }}</label>
        <button type="button"
            class="w-full flex items-center justify-between gap-2 bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-left transition-colors hover:border-emerald-300/30 focus:border-emerald-300/50 focus:outline-none"
            :class="{ 'border-emerald-400/40': open }"
            @click="open = !open">
            <span v-if="selectedNames.length" class="truncate text-white/90">
                {{ selectedNames.length === 1 ? selectedNames[0] : `${selectedNames.length} selected` }}
            </span>
            <span v-else class="text-white/40">{{ placeholder }}</span>
            <div class="flex items-center gap-1.5 shrink-0">
                <span v-if="selectedNames.length" class="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-1">{{ selectedNames.length }}</span>
                <Icon name="lucide:chevron-down" class="w-4 h-4 text-white/40 transition-transform" :class="{ 'rotate-180': open }" />
            </div>
        </button>

        <Transition name="dropdown">
            <div v-if="open" class="absolute z-50 mt-1 w-full rounded-xl border border-white/15 bg-[#14161c]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div class="p-2 border-b border-white/10">
                    <input v-model="filter" type="text" class="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-300/40 placeholder-white/35" :placeholder="`Search ${label.toLowerCase()}...`" />
                </div>
                <div class="p-1.5 max-h-52 overflow-y-auto">
                    <label v-if="filteredOptions.length > 5" type="button" class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs text-white/55">
                        <input type="checkbox" :checked="allSelected" @change="toggleAll" class="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span>Select All</span>
                    </label>
                    <div class="my-1 border-t border-white/10" />
                    <label v-for="opt in filteredOptions" :key="opt.id" class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                        <input type="checkbox" :checked="model.includes(opt.id)" @change="toggle(opt.id)" class="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-emerald-500" />
                        <span class="text-sm text-white/80 truncate">{{ opt.name }}</span>
                    </label>
                    <div v-if="!filteredOptions.length" class="px-2 py-4 text-center text-xs text-white/40">No results</div>
                </div>
                <div class="p-2 border-t border-white/10 flex items-center justify-between">
                    <button type="button" class="text-xs text-white/50 hover:text-white/80" @click="clear">Clear</button>
                    <button type="button" class="text-xs text-emerald-300 hover:text-emerald-200 font-medium" @click="open = false">Apply</button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    options: { type: Array, default: () => [] },
    label: { type: String, default: 'Select' },
    placeholder: { type: String, default: 'All' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const filter = ref('')
const rootEl = ref(null)

const filteredOptions = computed(() => {
    const q = filter.value.toLowerCase()
    return (props.options || []).filter(o => o.name.toLowerCase().includes(q))
})

const selectedNames = computed(() => {
    return (props.options || []).filter(o => props.modelValue.includes(o.id)).map(o => o.name)
})

const allSelected = computed(() => {
    return filteredOptions.value.length > 0 && filteredOptions.value.every(o => props.modelValue.includes(o.id))
})

function toggle(id) {
    const arr = [...props.modelValue]
    const idx = arr.indexOf(id)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(id)
    emit('update:modelValue', arr)
}

function toggleAll() {
    if (allSelected.value) {
        const ids = filteredOptions.value.map(o => o.id)
        emit('update:modelValue', props.modelValue.filter(id => !ids.includes(id)))
    } else {
        const ids = filteredOptions.value.map(o => o.id)
        const merged = [...new Set([...props.modelValue, ...ids])]
        emit('update:modelValue', merged)
    }
}

function clear() {
    emit('update:modelValue', [])
    filter.value = ''
}

function onClickOutside(e) {
    if (rootEl.value && !rootEl.value.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

watch(() => open.value, (v) => { if (!v) filter.value = '' })
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
