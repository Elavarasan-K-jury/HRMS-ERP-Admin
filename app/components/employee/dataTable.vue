<template>
    <!-- 🧩 Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.25)] px-4 py-10 flex items-center justify-center w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No employees found.</span>
    </div>

    <!-- 🔄 Loading Skeleton -->
    <div v-else-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="i in 8" :key="i" class="emp-card animate-pulse">
            <div class="flex items-start justify-between">
                <div class="skeleton-avatar" />
                <div class="skeleton skeleton-w-6" />
            </div>
            <div class="mt-4 space-y-2">
                <div class="skeleton skeleton-w-32" />
                <div class="skeleton skeleton-w-24" />
                <div class="skeleton skeleton-w-40" />
            </div>
            <div class="mt-4 flex items-center gap-2">
                <div class="skeleton skeleton-w-16" />
                <div class="skeleton skeleton-w-16" />
            </div>
        </div>
    </div>

    <!-- 🧠 Employee Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <article v-for="emp in items" :key="emp.id" class="emp-card group" :class="openMenuId === emp.id ? 'z-40' : ''" @click="openMenuId = null">
            <!-- Header row -->
            <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="emp-avatar" :class="avatarTone(emp)">
                        <img v-if="emp.profile_image" :src="emp.profile_image" alt="" class="h-full w-full object-cover rounded-xl" />
                        <span v-else>{{ initials(emp) }}</span>
                    </div>
                    <div class="min-w-0">
                        <h3 class="emp-name" :title="emp.full_name || '—'">
                            {{ emp.full_name || '—' }}
                        </h3>
                        <p class="emp-code">
                            <Icon name="lucide:badge-check" class="w-3.5 h-3.5" />
                            {{ emp.employee_code || '—' }}
                        </p>
                    </div>
                </div>

                <!-- ⋮ Kebab menu -->
                <div class="relative" @click.stop>
                    <button class="btn-kebab" :aria-label="'Actions for ' + (emp.full_name || '')"
                        @click="toggleMenu(emp.id)">
                        <Icon name="lucide:ellipsis-vertical" class="w-4 h-4" />
                    </button>
                    <transition name="dropdown">
                        <div v-if="openMenuId === emp.id" class="dropdown-menu" @click.stop>
                            <button class="dropdown-item" @click="closeAnd(() => $emit('view', emp))">
                                <Icon name="lucide:eye" class="w-4 h-4 text-emerald-300" />
                                <span>View Profile</span>
                            </button>
                            <NuxtLink target="_blank"
                                :to="`/organization/${emp.organization_id}/employee/${emp.id}/finance/salary`"
                                class="dropdown-item" @click="openMenuId = null">
                                <Icon name="bx:rupee" class="w-4 h-4 text-amber-300" />
                                <span>Salary</span>
                            </NuxtLink>
                            <button class="dropdown-item" @click="closeAnd(() => $emit('edit', emp))">
                                <Icon name="lucide:pencil" class="w-4 h-4 text-blue-300" />
                                <span>Edit Employee</span>
                            </button>
                            <div class="dropdown-divider" />
                            <button class="dropdown-item dropdown-item-danger" @click="closeAnd(() => $emit('delete', emp))">
                                <Icon name="lucide:trash-2" class="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                        </div>
                    </transition>
                </div>
            </div>

            <!-- Designation & department -->
            <div class="mt-4 space-y-1.5">
                <p class="text-sm font-medium text-white/90 flex items-center gap-2">
                    <Icon name="lucide:briefcase" class="w-4 h-4 text-emerald-300/80 shrink-0" />
                    <span class="truncate" :title="emp.designation?.name || '—'">{{ emp.designation?.name || '—' }}</span>
                </p>
                <p class="text-xs text-white/60 flex items-center gap-2">
                    <Icon name="lucide:building-2" class="w-4 h-4 text-white/40 shrink-0" />
                    <span class="truncate">{{ formatDepartment(emp) || '—' }}</span>
                </p>
                <p v-if="emp.band?.name || emp.band_name" class="text-xs text-white/60 flex items-center gap-2">
                    <Icon name="ion:git-branch-outline" class="w-4 h-4 text-white/40 shrink-0" />
                    <span class="truncate">{{ emp.band?.name || emp.band_name }}</span>
                </p>
                <p v-if="emp.email || emp.phone" class="text-xs text-white/60 flex items-center gap-2">
                    <Icon name="lucide:mail" class="w-4 h-4 text-white/40 shrink-0" />
                    <span class="truncate" :title="emp.email">{{ emp.email || '—' }}</span>
                </p>
                <p v-if="emp.phone" class="text-xs text-white/60 flex items-center gap-2">
                    <Icon name="lucide:phone" class="w-4 h-4 text-white/40 shrink-0" />
                    <span>{{ emp.phone }}</span>
                </p>
            </div>
        </article>
    </div>

    <!-- 📄 Pagination -->
    <div v-if="showPagination"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 mt-4 rounded-xl border border-white/10 bg-white/5">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/70">
            <label class="flex items-center gap-2">
                <span class="text-white/60">Rows per page</span>
                <select class="rows-select" :value="limit"
                    @change="$emit('limit-change', $event.target.value)">
                    <option v-for="n in limitOptions" :key="n" :value="n">{{ n }}</option>
                </select>
            </label>
            <span>
                Page <span class="text-white">{{ page }}</span> of
                <span class="text-white">{{ totalPages }}</span> —
                <span class="text-white">{{ total }}</span> results
            </span>
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
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDepartmentStore } from '../../stores/organization/department.store'

const departmentStore = useDepartmentStore()

const openMenuId = ref(null)

const toggleMenu = (id) => {
    openMenuId.value = openMenuId.value === id ? null : id
}

const closeAnd = (fn) => {
    openMenuId.value = null
    fn()
}

const onDocumentClick = () => {
    openMenuId.value = null
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))

const formatDepartment = (emp) => {
    if (emp.departments?.length) {
        const first = emp.departments[0]
        const dept = first.department
        if (dept?.name) return dept.name
    }
    if (emp.sub_department_name) return `${emp.sub_department_name} › ${emp.department_name || ''}`.trim()
    return emp.department_name || ''
}

const initials = (emp) => {
    const src = emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()
    if (!src) return '—'
    return src
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
}

const avatarTone = (emp) => {
    const tones = [
        'tone-emerald', 'tone-sky', 'tone-violet', 'tone-amber', 'tone-rose',
        'tone-teal', 'tone-indigo', 'tone-fuchsia',
    ]
    const name = emp.full_name || emp.id || ''
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
    return tones[Math.abs(hash) % tones.length]
}

const props = defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    total: { type: Number, default: 0 },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
    limit: { type: Number, default: 10 },
})

const limitOptions = [10, 20, 30, 40, 50]

defineEmits(['view', 'edit', 'delete', 'prev', 'next', 'limit-change'])
const showPagination = computed(() => props.total > 0)
</script>

<style scoped>
/* 🧱 Card base */
.emp-card {
    @apply relative flex flex-col rounded-2xl border border-white/10 bg-white/[.04] backdrop-blur-xl
           p-4 shadow-[0_8px_30px_rgba(0,0,0,.18)] transition-all duration-300
           hover:border-emerald-300/30 hover:bg-white/[.07] hover:shadow-[0_12px_40px_rgba(0,0,0,.28),0_0_20px_rgba(74,255,122,.06)]
           hover:-translate-y-0.5;
}

.emp-avatar {
    @apply flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white/90
           shadow-inner;
}

.tone-emerald { background: linear-gradient(135deg, rgba(16,185,129,.35), rgba(6,78,59,.6)); }
.tone-sky { background: linear-gradient(135deg, rgba(14,165,233,.35), rgba(8,47,73,.6)); }
.tone-violet { background: linear-gradient(135deg, rgba(139,92,246,.35), rgba(46,16,101,.6)); }
.tone-amber { background: linear-gradient(135deg, rgba(245,158,11,.35), rgba(69,26,3,.6)); }
.tone-rose { background: linear-gradient(135deg, rgba(244,63,94,.35), rgba(76,5,25,.6)); }
.tone-teal { background: linear-gradient(135deg, rgba(20,184,166,.35), rgba(4,47,46,.6)); }
.tone-indigo { background: linear-gradient(135deg, rgba(99,102,241,.35), rgba(30,27,75,.6)); }
.tone-fuchsia { background: linear-gradient(135deg, rgba(217,70,239,.35), rgba(59,7,100,.6)); }

.emp-name {
    @apply truncate text-sm font-semibold text-white;
}

.emp-code {
    @apply mt-0.5 flex items-center gap-1 text-[11px] font-medium text-white/50;
}

/* ⋮ Kebab button */
.btn-kebab {
    @apply inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition
           hover:bg-white/10 hover:text-white;
}

/* Dropdown */
.dropdown-menu {
    @apply absolute right-0 top-9 z-30 min-w-[180px] overflow-hidden rounded-xl border border-white/10
           bg-[#10141c] shadow-[0_20px_50px_rgba(0,0,0,.45)] backdrop-blur-xl py-1.5;
}

.dropdown-item {
    @apply flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/80 transition
           hover:bg-white/10 hover:text-white;
}

.dropdown-item-danger {
    @apply text-red-300/90 hover:bg-red-500/15 hover:text-red-200;
}

.dropdown-divider {
    @apply my-1.5 border-t border-white/10;
}

.dropdown-enter-active { transition: all .16s ease-out; }
.dropdown-leave-active { transition: all .12s ease-in; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px) scale(.98); }

/* Pagination */
.btn-lite {
    @apply inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-sm text-white transition
           hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60;
}

.rows-select {
    @apply rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-sm text-white outline-none
           hover:bg-white/15 focus:border-white/30;
}
.rows-select option {
    color: #111;
    background: #1e1e28;
}

/* Skeleton shimmer */
.skeleton {
    height: .875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255,255,255,.12), rgba(255,255,255,.22), rgba(255,255,255,.12));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}

.skeleton-w-6 { width: 1.5rem; height: 1.5rem; }
.skeleton-w-16 { width: 4rem; }
.skeleton-w-24 { width: 6rem; }
.skeleton-w-32 { width: 8rem; }
.skeleton-w-40 { width: 10rem; }

.skeleton-avatar {
    height: 3rem;
    width: 3rem;
    border-radius: .75rem;
    background: linear-gradient(90deg, rgba(255,255,255,.12), rgba(255,255,255,.22), rgba(255,255,255,.12));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
</style>
