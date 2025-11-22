<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-10 flex items-center justify-center w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No employees found.</span>
    </div>

    <!-- 🧠 Table -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Employee</th>
                        <th class="th">Email / Phone</th>
                        <th class="th">Designation</th>
                        <th class="th">Category</th>
                        <th class="th">Organization</th>
                        <th class="th">Gender</th>
                        <th class="th">DOB</th>
                        <th class="th">Created</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- 🔄 Skeleton Loader -->
                    <template v-if="loading">
                        <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td class="td">
                                <div class="skeleton w-44" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-56" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-40" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-32" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-56" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-20" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-28" />
                            </td>
                            <td class="td text-right">
                                <div class="skeleton w-16 ml-auto" />
                            </td>
                        </tr>
                    </template>

                    <!-- ✅ Data Rows -->
                    <tr v-else v-for="emp in items" :key="emp.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <!-- 👤 Employee -->
                        <td class="td align-top font-semibold text-white">
                            <div class="flex flex-col">
                                <span>{{ emp.full_name || emp.first_name || '—' }}</span>
                                <span v-if="emp.employee_code" class="text-xs text-white/70 mt-0.5">
                                    CODE: {{ emp.employee_code || '—' }}
                                </span>
                                <span class="text-xs text-white/70 mt-0.5">
                                    ID: {{ emp.id.slice(-6) }}
                                </span>
                            </div>
                        </td>

                        <!-- 📧 Email / Phone -->
                        <td class="td align-top text-sm">
                            <div class="flex flex-col gap-0.5">
                                <span>{{ emp.email || '—' }}</span>
                                <span class="text-xs text-white/70">{{ emp.phone || '—' }}</span>
                            </div>
                        </td>

                        <!-- 🧑‍💻 Designation -->
                        <td class="td align-top">
                            <div class="flex flex-col">
                                <span class="font-medium text-white/90">
                                    {{ emp.designation?.name || '—' }}
                                </span>
                                <span class="text-xs text-white/60">
                                    {{ formatLevel(emp.designation?.level) }}
                                </span>
                            </div>
                        </td>

                        <!-- 🧩 Category -->
                        <td class="td align-top">
                            <div class="flex flex-col">
                                <span class="font-medium">{{ emp.category?.name || '—' }}</span>
                                <span class="text-xs text-white/70">Code: {{ emp.category?.code || '—' }}</span>
                            </div>
                        </td>

                        <!-- 🏢 Organization -->
                        <td class="td align-top max-w-[250px] truncate">
                            <span class="font-medium">{{ emp.organization?.name || '—' }}</span>
                            <div class="text-xs text-white/70 mt-0.5">
                                {{ emp.organization?.email || '—' }}
                            </div>
                        </td>

                        <!-- ⚧ Gender -->
                        <td class="td align-top capitalize">
                            {{ emp.gender?.toLowerCase() === 'male' ? 'Male' : 'Female' }}
                        </td>

                        <!-- 🎂 DOB -->
                        <td class="td align-top">
                            {{ emp.date_of_birth }}
                        </td>

                        <!-- 🕒 Created -->
                        <td class="td align-top">
                            {{ emp.created_at }}
                        </td>

                        <!-- ⚙️ Actions -->
                        <td class="td align-top text-right">
                            <div class="inline-flex flex-col items-center gap-1.5">
                                <button class="btn-icon" title="View" @click="$emit('view', emp)">
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </button>
                                <button class="btn-icon" title="Edit" @click="$emit('edit', emp)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </button>
                                <button class="btn-icon-danger" title="Delete" @click="$emit('delete', emp)">
                                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 📄 Pagination -->
        <div v-if="showPagination"
            class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-white/10 bg-white/5">
            <div class="text-xs text-white/70">
                Page <span class="text-white">{{ page }}</span> of
                <span class="text-white">{{ totalPages }}</span> —
                <span class="text-white">{{ total }}</span> results
            </div>

            <div class="flex items-center gap-1.5">
                <button class="btn-lite" :disabled="page <= 1 || loading" @click="$emit('prev')">
                    <Icon name="lucide:chevron-left" class="w-4 h-4" /> Prev
                </button>
                <button class="btn-lite" :disabled="page >= totalPages || loading" @click="$emit('next')">
                    Next
                    <Icon name="lucide:chevron-right" class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
})

defineEmits(['view', 'edit', 'delete', 'prev', 'next'])
const showPagination = computed(() => props.totalPages > 1)

function formatLevel(level) {
    if (!level) return '—'
    return level.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}

.td {
    @apply px-4 py-3 align-middle text-white/90;
}

/* Buttons */
.btn-icon {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}

.btn-icon-danger {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/70 text-white transition;
}

.btn-lite {
    @apply px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1;
}

/* Skeleton shimmer */
.skeleton {
    height: 0.875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .22), rgba(255, 255, 255, .12));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}
</style>
