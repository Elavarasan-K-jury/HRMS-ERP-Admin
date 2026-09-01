<template>
    <div class="p-5 flex flex-col gap-4 min-h-0 overflow-hidden">
        <div v-if="!costCenter" class="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Icon name="lucide:users" class="text-4xl text-white/25" />
            <p class="text-sm text-white/50">Select a cost center to manage its employees.</p>
        </div>

        <template v-else>
            <div class="flex items-center justify-between gap-3">
                <div class="w-72">
                    <UiSearch v-model="search" placeholder="Search by name, code, email…" color="#4aff7a"
                        prepend-icon="ion:search-outline" clearable size="sm" rounded="lg"
                        @clear="search = ''" />
                </div>
                <UiButton color="#4aff7a" text="Assign Employees" prepend-icon="lucide:user-plus"
                    @click="$emit('assign')" />
            </div>

            <div class="flex-1 min-h-0 overflow-auto glass-scroll rounded-xl border border-white/10">
                <div v-if="loading" class="flex items-center justify-center py-16">
                    <UiLoader />
                </div>
                <template v-else-if="employees.length">
                    <table class="w-full text-sm">
                        <thead class="sticky top-0 bg-[#14161c]/95 backdrop-blur-xl">
                            <tr class="text-left text-[10px] uppercase tracking-[0.14em] text-white/45 border-b border-white/10">
                                <th class="px-4 py-3 font-semibold">Employee Number</th>
                                <th class="px-4 py-3 font-semibold">Employee Name</th>
                                <th class="px-4 py-3 font-semibold">Job Title / Designation</th>
                                <th class="px-4 py-3 font-semibold">Reporting To</th>
                                <th class="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="e in employees" :key="e.id"
                                class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td class="px-4 py-3 text-white/70 font-mono text-xs">{{ e.employee_code || '—' }}</td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center gap-2.5">
                                        <span class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold uppercase
                                            bg-white/10 text-white/70 overflow-hidden">
                                            <img v-if="avatarUrl(e)" :src="avatarUrl(e)" alt=""
                                                class="w-full h-full object-cover" />
                                            <span v-else>{{ initials(e.full_name) }}</span>
                                        </span>
                                        <div class="min-w-0">
                                            <p class="text-white/90 font-medium truncate">{{ e.full_name || '—' }}</p>
                                            <p class="text-xs text-white/45 truncate">{{ e.email || '' }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-white/75">{{ e.designation_name || '—' }}</td>
                                <td class="px-4 py-3 text-white/75">{{ e.reporting_manager_name || '—' }}</td>
                                <td class="px-4 py-3 text-right">
                                    <button type="button"
                                        class="p-1.5 rounded-lg text-rose-300/70 hover:bg-rose-500/10 hover:text-rose-200 transition-colors"
                                        :title="'Remove from cost center'" @click="$emit('remove', e)">
                                        <Icon name="lucide:user-x" class="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="total > employees.length" class="flex items-center justify-between px-4 py-3">
                        <p class="text-xs text-white/45">Showing {{ employees.length }} of {{ total }}</p>
                        <UiButton size="xs" color="#fff" text="Load more" @click="$emit('load-more')" />
                    </div>
                </template>

                <div v-else class="flex flex-col items-center justify-center gap-2 py-16 text-center">
                    <Icon name="lucide:users" class="text-4xl text-white/25" />
                    <p class="text-sm text-white/70">No employees assigned to this cost center</p>
                    <p class="text-xs text-white/45">Click "Assign Employees" to link employees.</p>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { resolveMediaUrl } from '~/utils/media'

const props = defineProps({
    costCenter: { type: Object, default: null },
    employees: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
})

const emit = defineEmits(['assign', 'remove', 'load-more', 'search'])

const search = ref('')
watch(search, (v) => emit('search', v))

const avatarUrl = (e) => {
    const ref = e?.profile_image_file_id ? `/file/${e.profile_image_file_id}` : (e?.profile_image || '')
    return resolveMediaUrl(ref)
}

const initials = (name) => {
    if (!name) return '?'
    return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
</script>

<style scoped>
.glass-scroll {
    scrollbar-width: thin;
}

.glass-scroll::-webkit-scrollbar {
    width: 6px;
}

.glass-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
}

.glass-scroll::-webkit-scrollbar-thumb {
    border-radius: 9999px;
    background: rgba(74, 255, 122, 0.25);
}
</style>