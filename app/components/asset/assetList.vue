<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-10 flex items-center justify-center w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No asset categories found.</span>
    </div>

    <!-- 🧠 Table -->
    <div v-else
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)]">
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                    <tr>
                        <th class="th">Serial Number</th>
                        <th class="th">Model</th>
                        <th class="th">Category</th>
                        <th class="th">Status</th>
                        <th class="th">Assignment Status</th>
                        <th class="th">Credentials</th>
                        <th class="th">Dates</th>
                        <th class="th text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <!-- 🔄 Skeleton Loader -->
                    <template v-if="loading">
                        <tr v-for="i in 5" :key="i" class="border-b border-white/5 animate-pulse">
                            <td class="td">
                                <div class="skeleton w-40" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-60" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-20" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td">
                                <div class="skeleton w-24" />
                            </td>
                            <td class="td text-right">
                                <div class="skeleton w-16 ml-auto" />
                            </td>
                        </tr>
                    </template>

                    <!-- ✅ Data Rows -->
                    <tr v-else v-for="item in items" :key="item.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">

                        <!-- Name -->
                        <td class="td font-semibold text-white capitalize">
                            {{ item.serial_number || '—' }}
                            <div class="text-xs text-white/70 mt-1">ID: {{ item.id.slice(-8) }}</div>
                        </td>

                        <!-- Code -->
                        <td class="td">{{ item.model?.model_name || '—' }}</td>

                        <!-- Description -->
                        <td class="td">
                            {{ item.category.name || '-' }}
                        </td>

                        <!-- Status -->
                        <td class="td">
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                                :class="statusBadgeClass(item.status)">
                                <Icon :name="statusIcon(item.status)" class="w-3.5 h-3.5" />
                                {{ item.status || '—' }}
                            </span>
                        </td>

                        <!-- Assignment Status -->
                        <td class="td">
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
                                :class="statusAssignmentBadgeClass(getCureentAssignmentStatus(item.assignments))">
                                <Icon :name="statusAssignmentIcon(getCureentAssignmentStatus(item.assignments))"
                                    class="w-3.5 h-3.5" />
                                {{ getCureentAssignmentStatus(item.assignments) || '—' }}
                            </span>
                        </td>


                        <!-- Created -->
                        <td class="td">
                            <div class="flex flex-col">
                                <span v-if="item.credentials?.user_name"
                                    class="group cursor-pointer inline-flex items-center select-none gap-2">
                                    <span class="text-white/70">Username:</span>

                                    <!-- masked (default) -->
                                    <span class="group-hover:hidden font-mono">
                                        {{ "*".repeat(item.credentials?.user_name.length) }}
                                    </span>

                                    <!-- real (on hover) -->
                                    <span class="hidden group-hover:inline font-mono">
                                        {{ item.credentials?.user_name }}
                                    </span>
                                </span>

                                <span v-if="item.credentials?.password"
                                    class="group cursor-pointer inline-flex items-center select-none gap-2">
                                    <span class="text-white/70">Password:</span>

                                    <!-- masked (default) -->
                                    <span class="group-hover:hidden font-mono">
                                        {{ "*".repeat(item.credentials.password.length) }}
                                    </span>

                                    <!-- real (on hover) -->
                                    <span class="hidden group-hover:inline font-mono">
                                        {{ item.credentials.password }}
                                    </span>
                                </span>
                            </div>
                        </td>

                        <!-- Updated -->
                        <td class="td grid capitalize grid-cols-1">
                            <span>created: {{ format(item.created_at || new Date()) }}</span>
                            <span>updated: {{ format(item.updated_at || new Date()) }}</span>
                        </td>

                        <!-- Actions -->
                        <td class="td text-right">
                            <div class="inline-flex items-center gap-1">
                                <!-- <button class="btn-icon" title="View" @click="$emit('view', item)">
                                    <Icon name="lucide:eye" class="w-4 h-4" />
                                </button> -->
                                <UiButton color="#fff" :disabled="item.assignments?.find(a =>
                                    ['ASSIGNMENT_PENDING', 'REQUESTED', 'ASSIGNED', 'IN_REPAIR', 'DAMAGED', 'LOST', 'RETIRED',
                                        'DISPOSED'].includes(a.status)
                                ) || (item.status == 'ASSIGNED' || item.status == 'RETIRED')" class="btn-icon"
                                    title="Edit" @click="$emit('assign', item)">
                                    <div class="flex gap-2 items-center">
                                        <Icon name="heroicons:user" />
                                        <Icon name="heroicons:arrow-left-16-solid" />
                                        <Icon name="ion:laptop-outline" />
                                    </div>
                                </UiButton>
                                <UiButton color="#ff9100" class="btn-icon" title="Edit" @click="$emit('edit', item)">
                                    <Icon name="lucide:pencil" class="w-4 h-4" />
                                </UiButton>
                                <UiButton color="#ff0000" class="btn-icon-danger" title="Delete"
                                    @click="$emit('delete', item)">
                                    <Icon name="lucide:trash-2" class="w-4 h-4" />
                                </UiButton>
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
import { computed } from "vue";

const props = defineProps({
    items: Array,
    loading: Boolean,
    total: Number,
    page: Number,
    totalPages: Number,
});

defineEmits(["view", "edit", "delete", "assign", "prev", "next"]);

const getCureentAssignmentStatus = (data = []) => {
    if (!Array.isArray(data) || data.length === 0) return "AVAILABLE";

    // filter out deleted records
    const activeAssignments = data.filter(a => !a.deleted_at);

    if (activeAssignments.length === 0) return "AVAILABLE";

    // sort by latest activity
    activeAssignments.sort((a, b) => {
        const aTime = new Date(a.updated_at || a.created_at || a.assigned_at || 0).getTime();
        const bTime = new Date(b.updated_at || b.created_at || b.assigned_at || 0).getTime();
        return bTime - aTime;
    });
    console.log('assetList.vue @ Line 217:', activeAssignments[0].status || null);
    return activeAssignments[0].status || 'AVAILABLE';
}
const showPagination = computed(() => props.totalPages > 1);
function statusBadgeClass(status) {
    switch (status) {
        case 'AVAILABLE':
            return 'bg-emerald-500/20 text-emerald-300'
        case 'ASSIGNED':
            return 'bg-sky-500/20 text-sky-300'
        case 'IN_REPAIR':
            return 'bg-amber-500/20 text-amber-300'
        case 'RETIRED':
            return 'bg-rose-500/20 text-rose-300'
        default:
            return 'bg-white/10 text-white/70'
    }
}

function statusIcon(status) {
    switch (status) {
        case 'AVAILABLE':
            return 'lucide:check-circle'
        case 'ASSIGNED':
            return 'lucide:user-check'
        case 'IN_REPAIR':
            return 'lucide:wrench'
        case 'RETIRED':
            return 'lucide:archive'
        default:
            return 'lucide:help-circle'
    }
}

function statusAssignmentBadgeClass(status) {
    const map = {
        // Availability
        AVAILABLE: "bg-emerald-500/20 text-emerald-300",

        // Request & Approval Flow
        REQUESTED: "bg-blue-500/20 text-blue-300",
        APPROVAL_PENDING: "bg-amber-500/20 text-amber-300",
        APPROVED: "bg-emerald-500/20 text-emerald-300",
        REJECTED: "bg-red-500/20 text-red-300",

        // Assignment Lifecycle
        ASSIGNMENT_PENDING: "bg-indigo-500/20 text-indigo-300",
        ASSIGNED: "bg-green-500/20 text-green-300",

        // Return Lifecycle
        RETURN_REQUESTED: "bg-orange-500/20 text-orange-300",
        RETURN_APPROVED: "bg-emerald-500/20 text-emerald-300",
        RETURN_REJECTED: "bg-red-500/20 text-red-300",
        RETURNED: "bg-slate-500/20 text-slate-300",

        // Maintenance & Issues
        IN_REPAIR: "bg-yellow-500/20 text-yellow-300",
        REPAIR_COMPLETED: "bg-teal-500/20 text-teal-300",
        DAMAGED: "bg-red-600/20 text-red-400",
        LOST: "bg-rose-600/20 text-rose-400",

        // End of Life
        RETIRED: "bg-gray-500/20 text-gray-300",
        DISPOSED: "bg-zinc-600/20 text-zinc-300",
    };

    return map[status] || "bg-white/10 text-white/70";
}

function statusAssignmentIcon(status) {
    const map = {
        // Availability
        AVAILABLE: "lucide:check-circle",

        // Request & Approval Flow
        REQUESTED: "lucide:send",
        APPROVAL_PENDING: "lucide:clock",
        APPROVED: "lucide:check-circle-2",
        REJECTED: "lucide:x-circle",

        // Assignment Lifecycle
        ASSIGNMENT_PENDING: "lucide:hourglass",
        ASSIGNED: "lucide:user-check",

        // Return Lifecycle
        RETURN_REQUESTED: "lucide:undo-2",
        RETURN_APPROVED: "lucide:check-square",
        RETURN_REJECTED: "lucide:x-square",
        RETURNED: "lucide:package",

        // Maintenance & Issues
        IN_REPAIR: "lucide:tool",
        REPAIR_COMPLETED: "lucide:wrench",
        DAMAGED: "lucide:alert-triangle",
        LOST: "lucide:help-circle",

        // End of Life
        RETIRED: "lucide:archive",
        DISPOSED: "lucide:trash-2",
    };

    return map[status] || "lucide:info";
}


function format(dt) {
    return dt ? new Date(dt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }) : '—';
}
</script>

<style scoped>
.th {
    @apply text-left text-xs font-semibold uppercase tracking-wider text-white/60 px-4 py-3;
}

.td {
    @apply px-4 py-3 align-middle text-white/90;
}

.btn-icon {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition;
}

.btn-icon-danger {
    @apply p-2 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/70 text-white transition;
}

.btn-lite {
    @apply px-3 py-2 text-sm rounded-xl bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1;
}

.skeleton {
    height: 0.875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .22), rgba(255, 255, 255, .12));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0
    }

    100% {
        background-position: -200% 0
    }
}
</style>
