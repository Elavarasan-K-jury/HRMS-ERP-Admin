<template>
    <UiModal :model-value="modelValue" title="Assign Employees to Cost Center" width="720px"
        :show-footer="false" @update:model-value="close">
        <template #title>
            <div class="flex items-center gap-2">
                <Icon name="lucide:user-plus" class="w-5 h-5 text-emerald-300" />
                Assign Employees
            </div>
        </template>

        <div class="flex flex-col gap-4">
            <p class="text-sm text-white/70">
                Select employees to assign to <span class="font-semibold text-emerald-300">{{ costCenter?.name }}</span>.
                Employees moving from another cost center will be reassigned automatically.
            </p>

            <div>
                <UiSearch v-model="search" placeholder="Search employees…" color="#4aff7a"
                    prepend-icon="ion:search-outline" clearable size="sm" rounded="lg" />
            </div>

            <div v-if="loading" class="flex items-center justify-center py-12">
                <UiLoader />
            </div>

            <div v-else-if="filtered.length" class="flex flex-col gap-1 max-h-[45vh] overflow-y-auto glass-scroll pr-1">
                <label v-for="e in filtered" :key="e.id"
                    class="flex items-center gap-3 rounded-lg px-3 py-2.5 border cursor-pointer transition-colors select-none"
                    :class="isSelected(e.id)
                        ? 'bg-emerald-400/15 border-emerald-300/40'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'">
                    <input type="checkbox" class="accent-emerald-400 w-4 h-4"
                        :checked="isSelected(e.id)" @change="toggle(e.id)" />
                    <span class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold uppercase
                        bg-white/10 text-white/70 overflow-hidden">
                        <img v-if="avatarUrl(e)" :src="avatarUrl(e)" alt="" class="w-full h-full object-cover" />
                        <span v-else>{{ initials(e.full_name) }}</span>
                    </span>
                    <span class="flex-1 min-w-0">
                        <span class="block text-sm text-white/90 font-medium truncate">{{ e.full_name || '—' }}</span>
                        <span class="block text-[11px] text-white/45 truncate">
                            {{ e.employee_code || '' }}{{ e.designation_name ? ` • ${e.designation_name}` : '' }}
                        </span>
                    </span>
                    <span v-if="isAssigned(e.id)" class="text-[10px] px-2 py-0.5 rounded-full bg-sky-400/15 border border-sky-300/30 text-sky-200">
                        Assigned here
                    </span>
                </label>
            </div>

            <div v-else class="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Icon name="lucide:users" class="text-4xl text-white/25" />
                <p class="text-sm text-white/60">No employees found.</p>
            </div>

            <div class="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                <p class="text-xs text-white/50">{{ selected.length }} selected</p>
                <div class="flex gap-2">
                    <UiButton color="#fff" text="Cancel" prepend-icon="ion:close-circle" @click="close" />
                    <UiButton color="#4aff7a" text="Assign Employees" prepend-icon="lucide:user-plus"
                        :loading="saving" :disabled="!selected.length" @click="submit" />
                </div>
            </div>
        </div>
    </UiModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { resolveMediaUrl } from '~/utils/media'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    costCenter: { type: Object, default: null },
    orgId: { type: String, default: '' },
    assignedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'assign'])

const employees = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const selected = ref([])

watch(() => props.modelValue, (open) => {
    if (open) {
        selected.value = [...props.assignedIds]
        fetchEmployees()
    }
})

const fetchEmployees = async () => {
    loading.value = true
    try {
        const { $api } = useNuxtApp()
        const { data } = await $api.get('/employees/all', {
            params: { organization_id: props.orgId },
        })
        employees.value = data?.employees || []
    } catch (err) {
        console.error('[assign-employees] fetch error:', err)
        employees.value = []
    } finally {
        loading.value = false
    }
}

const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return employees.value
    return employees.value.filter(e =>
        String(e.full_name || '').toLowerCase().includes(q)
        || String(e.employee_code || '').toLowerCase().includes(q)
        || String(e.email || '').toLowerCase().includes(q)
        || String(e.designation?.name || '').toLowerCase().includes(q))
})

const isAssigned = (id) => props.assignedIds.includes(id)
const isSelected = (id) => selected.value.includes(id)

const toggle = (id) => {
    if (isAssigned(id)) return
    selected.value = selected.value.includes(id)
        ? selected.value.filter(x => x !== id)
        : [...selected.value, id]
}

const avatarUrl = (e) => {
    const ref = e?.profile_image_file_id ? `/file/${e.profile_image_file_id}` : (e?.profile_image || '')
    return resolveMediaUrl(ref)
}

const initials = (name) => {
    if (!name) return '?'
    return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const submit = async () => {
    if (!selected.value.length) return
    saving.value = true
    try {
        await emit('assign', selected.value)
        close()
    } finally {
        saving.value = false
    }
}

const close = () => emit('update:modelValue', false)
</script>

<style scoped>
.glass-scroll {
    scrollbar-width: thin;
}

.glass-scroll::-webkit-scrollbar {
    width: 6px;
}

.glass-scroll::-webkit-scrollbar-thumb {
    border-radius: 9999px;
    background: rgba(74, 255, 122, 0.25);
}
</style>