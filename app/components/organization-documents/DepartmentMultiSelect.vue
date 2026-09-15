<template>
    <div class="relative" ref="rootEl">
        <label class="block text-sm text-white/85 mb-1.5">{{ label }}</label>
        <button type="button"
            class="w-full flex items-center justify-between gap-2 bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-left transition-colors hover:border-emerald-300/30 focus:border-emerald-300/50 focus:outline-none"
            :class="{ 'border-emerald-400/40': open }"
            @click="open = !open">
            <span v-if="selectedCount" class="truncate text-white/90">
                {{ selectedCount === 1 ? selectedLabel : `${selectedCount} selected` }}
            </span>
            <span v-else class="text-white/40">{{ placeholder }}</span>
            <div class="flex items-center gap-1.5 shrink-0">
                <span v-if="selectedCount" class="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-1">{{ selectedCount }}</span>
                <Icon name="lucide:chevron-down" class="w-4 h-4 text-white/40 transition-transform" :class="{ 'rotate-180': open }" />
            </div>
        </button>

        <Transition name="dropdown">
            <div v-if="open" class="absolute z-50 mt-1 w-full rounded-xl border border-white/15 bg-[#14161c]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div class="p-2 border-b border-white/10">
                    <input v-model="filter" type="text" class="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-emerald-300/40 placeholder-white/35" placeholder="Search departments..." />
                </div>
                <div class="p-1.5 max-h-64 overflow-y-auto">
                    <div v-for="dept in filteredTree" :key="dept.id">
                        <label class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                            <input type="checkbox" :checked="isDeptSelected(dept)" @change="toggleDept(dept)" class="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-emerald-500" />
                            <span class="text-sm text-white/80 font-medium">{{ dept.name }}</span>
                        </label>
                        <div v-if="dept.sub_departments?.length" class="ml-5 space-y-0.5">
                            <label v-for="sub in dept.sub_departments" :key="sub.id" class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer">
                                <input type="checkbox" :checked="modelValue.includes(sub.id)" @change="toggleSub(sub.id)" class="w-3.5 h-3.5 rounded border-white/20 bg-white/10 text-emerald-500" />
                                <span class="text-xs text-white/65">{{ sub.name }}</span>
                            </label>
                        </div>
                    </div>
                    <div v-if="!filteredTree.length" class="px-2 py-4 text-center text-xs text-white/40">No results</div>
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
    departments: { type: Array, default: () => [] },
    label: { type: String, default: 'Departments' },
    placeholder: { type: String, default: 'All departments' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const filter = ref('')
const rootEl = ref(null)

const filteredTree = computed(() => {
    const q = filter.value.toLowerCase()
    if (!q) return props.departments
    return props.departments.filter(d => {
        const deptMatch = d.name.toLowerCase().includes(q)
        const subMatch = (d.sub_departments || []).some(s => s.name.toLowerCase().includes(q))
        return deptMatch || subMatch
    }).map(d => {
        if (d.name.toLowerCase().includes(q)) return d
        return { ...d, sub_departments: (d.sub_departments || []).filter(s => s.name.toLowerCase().includes(q)) }
    })
})

const selectedCount = computed(() => props.modelValue.length)

const selectedLabel = computed(() => {
    if (!props.modelValue.length) return ''
    const names = []
    for (const d of props.departments) {
        if (props.modelValue.includes(d.id)) names.push(d.name)
        for (const s of (d.sub_departments || [])) {
            if (props.modelValue.includes(s.id)) names.push(s.name)
        }
    }
    return names[0] || ''
})

function isDeptSelected(dept) {
    const allSubIds = (dept.sub_departments || []).map(s => s.id)
    if (!allSubIds.length) return props.modelValue.includes(dept.id)
    return allSubIds.every(id => props.modelValue.includes(id))
}

function toggleDept(dept) {
    const subIds = (dept.sub_departments || []).map(s => s.id)
    if (!subIds.length) {
        toggleSub(dept.id)
        return
    }
    if (isDeptSelected(dept)) {
        emit('update:modelValue', props.modelValue.filter(id => !subIds.includes(id)))
    } else {
        emit('update:modelValue', [...new Set([...props.modelValue, ...subIds])])
    }
}

function toggleSub(id) {
    const arr = [...props.modelValue]
    const idx = arr.indexOf(id)
    if (idx >= 0) arr.splice(idx, 1)
    else arr.push(id)
    emit('update:modelValue', arr)
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
