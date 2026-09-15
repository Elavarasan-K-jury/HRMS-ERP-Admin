<template>
    <!-- Empty State -->
    <div v-if="!items?.length && !loading"
        class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex items-center justify-center w-full gap-2 text-white/70">
        <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
        <span>No policies found.</span>
    </div>

    <!-- List + Detail -->
    <div v-else class="grid grid-cols-12 gap-3">
        <!-- Sidebar list -->
        <div class="col-span-12 lg:col-span-4 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
            <div class="px-4 py-3 border-b border-white/10 bg-white/5">
                <p class="text-xs font-semibold uppercase tracking-wider text-white/50">Policies ({{ items?.length || 0 }})</p>
            </div>
            <div class="max-h-[560px] overflow-y-auto p-1.5">
                <template v-if="loading">
                    <div v-for="i in 4" :key="i" class="animate-pulse p-3">
                        <div class="skeleton w-40 mb-2" />
                        <div class="skeleton w-24" />
                    </div>
                </template>

                <button v-for="(p, i) in items" :key="p.id" type="button"
                    class="w-full text-left flex items-center justify-between gap-2 rounded-lg px-3 py-3 transition-colors group"
                    :class="i === selectedIndex
                        ? 'bg-emerald-500/15 border border-emerald-400/40'
                        : 'border border-transparent hover:bg-white/5'"
                    @click="select(i)">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 min-w-0">
                            <span class="text-sm font-semibold truncate"
                                :class="i === selectedIndex ? 'text-emerald-200' : 'text-white/90'">
                                {{ p.name }}
                            </span>
                            <span class="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
                                :class="typeBadgeClass(p.policy_type)">
                                {{ p.policy_type || 'PROBATION' }}
                            </span>
                            <Icon v-if="p.is_default" name="lucide:star" class="w-3.5 h-3.5 text-amber-300 shrink-0"
                                title="Default policy" />
                        </div>
                        <p v-if="p.description" class="text-xs text-white/50 mt-0.5 truncate">{{ p.description }}</p>
                        <div class="flex items-center gap-2 mt-1.5">
                            <button type="button"
                                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-colors hover:bg-white/15"
                                :class="i === selectedIndex ? 'text-emerald-200' : 'text-white/60'"
                                @click.stop="loadAssignees(p)">
                                <Icon name="lucide:users" class="w-3 h-3" />
                                {{ employeeCount(p) }} assigned
                            </button>
                        </div>
                    </div>
                </button>
            </div>
        </div>

        <!-- Detail panel -->
        <div class="col-span-12 lg:col-span-8 rounded-xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
            <template v-if="selected">
                <div class="px-5 py-4 border-b border-white/10 bg-white/5 flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <h3 class="text-lg font-semibold text-white/90 truncate">{{ selected.name }}</h3>
                            <span
                                class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                                :class="typeBadgeClass(selected.policy_type)">
                                {{ selected.policy_type || 'PROBATION' }}
                            </span>
                            <span v-if="selected.is_default"
                                class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                                <Icon name="lucide:star" class="w-3 h-3" /> Default
                            </span>
                            <span
                                class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                :class="selected.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'">
                                <span class="w-1 h-1 rounded-full bg-current"></span>
                                {{ selected.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </div>
                        <button type="button" @click.stop="loadAssignees(selected)"
                            class="inline-flex items-center gap-1.5 mt-1 text-xs font-medium text-emerald-300/90 hover:text-emerald-200 hover:underline transition-colors">
                            <Icon name="lucide:users" class="w-3.5 h-3.5" />
                            {{ employeeCount(selected) }} employee(s) assigned
                        </button>
                        <p v-if="selected.description" class="text-sm text-white/50 mt-0.5">{{ selected.description }}</p>
                    </div>

                    <!-- 3-dot menu -->
                    <span class="relative shrink-0">
                        <button type="button" class="p-1.5 rounded-lg transition-colors"
                            :class="menuOpen ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'"
                            @click.stop="menuOpen = !menuOpen">
                            <Icon name="lucide:more-horizontal" class="w-5 h-5" />
                        </button>

                        <div v-if="menuOpen"
                            class="absolute right-0 top-full z-40 mt-1 w-44 rounded-lg border border-white/10 bg-[#14161c]/95 backdrop-blur-xl shadow-2xl p-1 animate-fade-in">
                            <button type="button" class="menu-item" @click="doEdit(selected)">
                                <Icon name="lucide:pencil" class="w-4 h-4" /> Edit
                            </button>
                            <button type="button" class="menu-item" @click="doClone(selected)">
                                <Icon name="lucide:copy" class="w-4 h-4" /> Clone
                            </button>
                            <button type="button" class="menu-item" :disabled="selected.is_default" @click="doSetDefault(selected)">
                                <Icon name="lucide:star" class="w-4 h-4" />
                                {{ selected.is_default ? 'Default policy' : 'Set as default' }}
                            </button>
                            <button type="button" class="menu-item" @click="doToggle(selected)">
                                <Icon name="lucide:power" class="w-4 h-4" />
                                {{ selected.is_active ? 'Deactivate' : 'Activate' }}
                            </button>
                            <div class="my-1 border-t border-white/10" />
                            <button type="button" class="menu-item-danger" @click="doDelete(selected)">
                                <Icon name="lucide:trash-2" class="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </span>
                </div>

                <UiTabs v-model="detailTab" :tabs="detailTabs" />
                <div class="p-5">
                    <!-- Tab 1 — Details (Step 1) -->
                    <div v-if="detailTab === 0" class="grid grid-cols-2 gap-4 animate-fade-in">
                        <PolicyItem label="Policy Duration" icon="lucide:hourglass">
                            {{ formatDuration(selected.duration_value, selected.duration_unit) }}
                        </PolicyItem>
                        <PolicyItem label="Max Extension" icon="lucide:trending-up">
                            {{ selected.max_duration_value && selected.max_duration_value > 0
                                ? formatDuration(selected.max_duration_value, selected.max_duration_unit)
                                : 'None' }}
                        </PolicyItem>
                        <PolicyItem label="End Date" icon="lucide:calendar-check">
                            <span :class="selected.end_date_after_completion ? 'text-emerald-300' : 'text-amber-400'">
                                {{ selected.end_date_after_completion ? 'Day after duration completes' : 'Last day of duration' }}
                            </span>
                        </PolicyItem>
                        <PolicyItem label="Applied Categories" icon="lucide:layers">
                            <div v-if="(selected.employee_categories || []).length" class="flex flex-wrap gap-1">
                                <span v-for="c in selected.employee_categories" :key="c.id"
                                    class="px-2 py-0.5 rounded-md text-xs bg-white/10 text-white/80">
                                    {{ c.name }}
                                </span>
                            </div>
                            <span v-else class="text-white/50">None selected</span>
                        </PolicyItem>
                        <PolicyItem label="Created" icon="lucide:calendar-plus">
                            {{ formatDate(selected.created_at) }}
                        </PolicyItem>
                        <PolicyItem label="Last Updated" icon="lucide:calendar-clock">
                            {{ formatDate(selected.updated_at) }}
                        </PolicyItem>
                    </div>

                    <!-- Tab 2 — Evaluation (Step 2) -->
                    <div v-else-if="detailTab === 1" class="space-y-4 animate-fade-in">
                        <div v-if="selected.evaluation_required" class="rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] p-4">
                            <div class="grid grid-cols-2 gap-3 mb-4">
                                <PolicyItem label="Auto trigger" icon="lucide:zap">
                                    <span :class="autoTriggerCount ? 'text-emerald-300' : 'text-white/40'">
                                        {{ autoTriggerCount ? `${autoTriggerCount} milestone(s) auto-trigger` : 'Manual trigger' }}
                                    </span>
                                </PolicyItem>
                                <PolicyItem label="Share feedback with employee" icon="lucide:share-2">
                                    <span :class="selected.share_feedback_with_employee ? 'text-emerald-300' : 'text-white/40'">
                                        {{ selected.share_feedback_with_employee ? 'Enabled' : 'Disabled' }}
                                    </span>
                                </PolicyItem>
                            </div>

                            <div class="flex flex-col gap-3">
                                <div v-for="(m, mIdx) in selected.evaluation_milestones || []" :key="mIdx"
                                    class="rounded-lg border border-white/10 bg-black/20 p-3">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm font-semibold text-white/90 flex items-center gap-2">
                                            {{ m.name || `Milestone ${mIdx + 1}` }}
                                            <span v-if="m.is_final_milestone"
                                                class="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                                                Final
                                            </span>
                                        </span>
                                        <span class="text-xs text-white/50">
                                            {{ m.automatic_trigger_enabled ? `auto after ${m.trigger_after_days} day(s)` : 'manual trigger' }}
                                        </span>
                                    </div>
                                    <div class="flex flex-col gap-1.5">
                                        <div v-for="(level, lIdx) in m.levels || []" :key="lIdx" class="text-xs text-white/70">
                                            <span class="text-sky-300 font-semibold">Level {{ level.level_order ?? lIdx + 1 }}</span>
                                            — {{ level.completion_rule === 'ANY' ? 'Any evaluator' : 'All evaluators' }}
                                            {{ (level.evaluators || []).length ? ` · ${level.evaluators.length} evaluator(s)` : '' }}
                                            <span v-if="level.reminder_enabled" class="text-white/40"> · reminder after {{ level.reminder_after_days }} day(s)</span>
                                            <span class="text-white/40">
                                                · {{ (level.evaluators || []).map(e => e.evaluator_name || e.evaluator_ref_id).join(', ') }}
                                            </span>
                                        </div>
                                        <div v-if="m.feedback_form_enabled" class="text-xs text-amber-300/90">
                                            <Icon name="lucide:file-text" class="w-3 h-3 inline mr-1" />
                                            Feedback form attached to this milestone
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60 flex items-center gap-2">
                            <Icon name="lucide:clipboard-x" class="w-4 h-4 text-white/40" />
                            Evaluation not required — probation is confirmed by duration.
                        </div>
                    </div>

                    <!-- Tab 3 — Confirmation (Step 3) -->
                    <div v-else-if="detailTab === 2" class="grid grid-cols-2 gap-4 animate-fade-in">
                        <PolicyItem label="Confirm automatically" icon="lucide:check-check">
                            <span :class="selected.auto_confirm_probation ? 'text-emerald-300' : 'text-white/40'">
                                {{ selected.auto_confirm_probation ? 'Enabled' : 'Manual (HR/Admin)' }}
                            </span>
                        </PolicyItem>
                        <PolicyItem label="Auto-generate letter" icon="lucide:file-text">
                            <span :class="selected.auto_generate_confirmation_letter ? 'text-emerald-300' : 'text-white/40'">
                                {{ selected.auto_generate_confirmation_letter ? 'Enabled' : 'Disabled' }}
                            </span>
                        </PolicyItem>
                    </div>

                    <!-- Tab 4 — Assignment (Step 4) -->
                    <div v-else class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 flex items-center gap-2 animate-fade-in">
                        <Icon name="lucide:info" class="w-4 h-4 shrink-0" />
                        The Assignment module is not implemented yet — this policy is fully configured and ready for
                        employee assignment once the module is built.
                    </div>
                </div>
            </template>

            <div v-else class="py-20 text-center text-sm text-white/50">
                Select a policy from the list to view its configuration.
            </div>
        </div>
    </div>

    <!-- Assigned Employees side modal (opens on click) -->
    <UiSidebarModal v-model="assigneeModalOpen" :width="'960px'" :show-footer="false" opaque>
        <template #title>Assigned Employees</template>
        <template #subtitle>
            <span v-if="assigneePolicy" class="inline-flex items-center gap-1.5">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {{ assigneePolicy.name }} · {{ filteredAssignees.length }} of {{ assignees.length }} shown
            </span>
        </template>
        <template #default>
            <div class="flex flex-col gap-3">
                <div class="relative">
                    <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input v-model="assigneeSearch" type="text" placeholder="Search by employee name or code..."
                        class="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/40 outline-none focus:border-emerald-400/50 transition-colors" />
                </div>

                <div v-if="assigneeLoading" class="py-16 flex flex-col items-center gap-3 text-white/50">
                    <Icon name="lucide:loader-circle" class="w-7 h-7 animate-spin text-emerald-400" />
                    <span class="text-sm">Loading employees…</span>
                </div>
                <div v-else-if="filteredAssignees.length"
                    class="overflow-x-auto glass-scroll rounded-xl border border-white/10">
                    <table class="min-w-full text-sm text-white/90">
                        <thead class="sticky top-0 z-10 bg-[#14161c]/95 border-b border-white/10">
                            <tr>
                                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Employee</th>
                                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Date of Joining</th>
                                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Probation End Date</th>
                                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Designation</th>
                                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Department</th>
                                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Sub-department</th>
                                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Location</th>
                                <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Reporting To</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="e in filteredAssignees" :key="e.id"
                                class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td class="px-4 py-3">
                                    <div class="font-semibold text-white">{{ e.full_name || '—' }}</div>
                                    <div class="text-xs text-white/50">{{ e.employee_code || '—' }}</div>
                                </td>
                                <td class="px-4 py-3 text-white/70">{{ formatDateOnly(e.joining_date) }}</td>
                                <td class="px-4 py-3 text-white/70">{{ formatDateOnly(e.probation_end_date) }}</td>
                                <td class="px-4 py-3 text-white/70">{{ e.designation?.name || '—' }}</td>
                                <td class="px-4 py-3 text-white/70">{{ e.department_name || '—' }}</td>
                                <td class="px-4 py-3 text-white/70">{{ e.sub_department_name || '—' }}</td>
                                <td class="px-4 py-3 text-white/70">{{ e.location_name || '—' }}</td>
                                <td class="px-4 py-3 text-white/70">{{ e.reporting_manager?.full_name || '—' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="py-16 flex flex-col items-center gap-2 text-white/50">
                    <Icon name="lucide:users" class="w-7 h-7 opacity-60" />
                    <span class="text-sm">{{ assigneeSearch ? 'No employees match your search.' : 'No active employees assigned to this policy.' }}</span>
                </div>
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import PolicyItem from '../policies/item.vue'
import { useProbationPolicyStore } from '../../stores/organization/probationPolicy.store'

const props = defineProps({
    items: Array,
    loading: Boolean,
    total: Number
})

const emit = defineEmits(['edit', 'delete', 'toggle', 'clone', 'set-default'])
const ppStore = useProbationPolicyStore()

const selectedIndex = ref(0)
const menuOpen = ref(false)
const detailTab = ref(0)

const selected = computed(() => props.items?.[selectedIndex.value] || null)

// Assigned Employees side modal
const assigneeModalOpen = ref(false)
const assigneeLoading = ref(false)
const assigneeSearch = ref('')
const assignees = ref([])
const assigneePolicy = ref(null)

const employeeCount = (p) => p?.employee_count ?? 0

const typeBadgeClass = (type) => {
    const map = {
        PROBATION: 'bg-emerald-500/20 text-emerald-300',
        INTERNSHIP: 'bg-sky-500/20 text-sky-300',
        TRAINEE: 'bg-amber-500/20 text-amber-300',
        CONTRACT: 'bg-pink-500/20 text-pink-300',
    }
    return map[type] || 'bg-white/10 text-white/60'
}

const filteredAssignees = computed(() => {
    const q = assigneeSearch.value.trim().toLowerCase()
    if (!q) return assignees.value
    return assignees.value.filter(e =>
        (e.full_name || '').toLowerCase().includes(q) ||
        (e.employee_code || '').toLowerCase().includes(q)
    )
})

async function loadAssignees(policy) {
    if (!policy) return
    assigneePolicy.value = policy
    assigneeModalOpen.value = true
    assigneeLoading.value = true
    assigneeSearch.value = ''
    assignees.value = []
    try {
        assignees.value = await ppStore.fetchPolicyEmployees(policy.id) || []
    } catch (err) {
        console.error('Failed to load policy assignees:', err)
        assignees.value = []
    } finally {
        assigneeLoading.value = false
    }
}

const detailTabs = [
    { label: 'Details', icon: 'lucide:file-text' },
    { label: 'Evaluation', icon: 'lucide:clipboard-check' },
    { label: 'Confirmation', icon: 'lucide:badge-check' },
    { label: 'Assignment', icon: 'lucide:users' },
]

const autoTriggerCount = computed(() =>
    (selected.value?.evaluation_milestones || []).filter(m => m.automatic_trigger_enabled).length
)

function select(i) {
    selectedIndex.value = i
    detailTab.value = 0
    menuOpen.value = false
}

function closeMenu() {
    menuOpen.value = false
}

const doEdit = (p) => { closeMenu(); emit('edit', p) }
const doClone = (p) => { closeMenu(); emit('clone', p) }
const doSetDefault = (p) => { closeMenu(); emit('set-default', p) }
const doToggle = (p) => { closeMenu(); emit('toggle', p) }
const doDelete = (p) => { closeMenu(); emit('delete', p) }

function onDocumentClick() {
    closeMenu()
}

onMounted(() => window.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => window.removeEventListener('click', onDocumentClick))

function formatDuration(value, unit) {
    const label = {
        MONTHS: 'month(s)',
        WEEKS: 'week(s)',
        DAYS: 'day(s)'
    }[unit] || unit
    return `${value ?? '—'} ${label}`
}

function formatDateOnly(d) {
    if (!d) return '—'
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return d
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

function formatDate(d) {
    if (!d) return '—'
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return d
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}
</script>

<style scoped>
.menu-item {
    @apply w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed;
}

.menu-item-danger {
    @apply w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium text-red-400/90 hover:bg-red-500/20 hover:text-red-300 transition-colors;
}

.skeleton {
    height: 0.875rem;
    border-radius: 9999px;
    background: linear-gradient(90deg, rgba(255, 255, 255, .12), rgba(255, 255, 255, .22), rgba(255, 255, 255, .12));
    animation: shimmer 1.2s infinite;
}

.glass-scroll {
    scrollbar-width: thin;
}

.glass-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
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