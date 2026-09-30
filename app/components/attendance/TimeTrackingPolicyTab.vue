<template>
    <div class="flex flex-col gap-3 flex-1 min-h-0" data-testid="ttp-root">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mt-3">
            <div>
                <h1 class="text-2xl md:text-3xl font-bold" data-testid="ttp-title">Time Tracking Policy</h1>
                <p class="text-sm text-white/50 mt-1" data-testid="ttp-subtitle">
                    Configure how attendance time is captured and tracked for employees.
                </p>
            </div>
            <UiButton color="#4aff7a" text="Add Time Tracking Policy" prepend-icon="ion:add-circle"
                data-testid="ttp-add-policy" @click="wizardOpen = true" />
        </div>

        <!-- Main workspace: flat list | dominant detail | compact allocation -->
        <div class="grid grid-cols-1 lg:grid-cols-[21%_minmax(0,1fr)_17%] gap-3 items-start mt-3">
            <!-- Left: policy master list (flat rows inside one panel) -->
            <div class="rounded-xl border border-white/10 bg-white/5 overflow-hidden" data-testid="ttp-list-panel">
                <div class="p-3 border-b border-white/10">
                    <UiSearch v-model="search" color="#fff" placeholder="Search policies..."
                        data-testid="ttp-search" />
                </div>

                <div class="flex flex-col gap-1 p-2 max-h-[320px] lg:max-h-[560px] overflow-y-auto" data-testid="ttp-list">
                    <button v-for="p in filteredPolicies" :key="p.id" type="button"
                        class="w-full text-left px-3 py-2.5 rounded-lg border-l-2 transition-colors"
                        :class="p.id === selectedId
                            ? 'bg-emerald-500/15 border-l-emerald-400'
                            : 'hover:bg-white/5 border-l-transparent'"
                        data-testid="ttp-item" :data-policy-id="p.id" @click="selectPolicy(p.id)">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-sm font-semibold truncate">{{ p.name }}</span>
                            <span v-if="p.isDefault"
                                class="shrink-0 rounded border border-emerald-400/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-200"
                                data-testid="ttp-item-default-badge">DEFAULT</span>
                        </div>
                        <div class="text-xs text-white/50 mt-0.5">
                            {{ p.employeesAssigned }} employee{{ p.employeesAssigned === 1 ? '' : 's' }}
                        </div>
                    </button>

                    <div v-if="!filteredPolicies.length" class="p-4 text-center text-sm text-white/50"
                        data-testid="ttp-empty">
                        No policies match your search.
                    </div>
                </div>
            </div>

            <!-- Center: selected policy detail (dominant) -->
            <div class="rounded-xl border border-white/10 bg-white/5" data-testid="ttp-detail">
                <template v-if="selected">
                    <!-- Compact policy header: title left, icon-only actions right -->
                    <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
                        <div class="flex items-center gap-2 min-w-0">
                            <h2 class="text-lg font-semibold truncate" data-testid="ttp-detail-name">{{ selected.name
                                }}</h2>
                            <span v-if="selected.isDefault"
                                class="shrink-0 rounded border border-emerald-400/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-200"
                                data-testid="ttp-detail-default-badge">DEFAULT</span>
                            <span class="text-xs text-white/50 shrink-0" data-testid="ttp-detail-employees">{{
                                selected.employeesAssigned }} employees</span>
                        </div>

                        <!-- 3-dot action menu (View / Edit / Delete — UI-only, Coming Soon behavior unchanged) -->
                        <div class="relative shrink-0" @click.stop>
                            <button type="button"
                                class="p-1.5 rounded-lg transition-colors"
                                :class="actionMenuOpen ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white hover:bg-white/10'"
                                title="Actions" aria-label="Actions" data-testid="ttp-action-menu"
                                @click="actionMenuOpen = !actionMenuOpen">
                                <Icon name="ion:ellipsis-vertical" class="w-4 h-4" />
                            </button>
                            <div v-if="actionMenuOpen"
                                class="absolute right-0 top-full mt-1 w-36 rounded-lg bg-[#1a1d27] border border-white/15 shadow-xl z-50 py-1">
                                <button type="button" data-testid="ttp-action-view"
                                    class="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                                    @click="runAction('View')">
                                    <Icon name="ion:eye-outline" class="w-3.5 h-3.5" />
                                    View
                                </button>
                                <button type="button" data-testid="ttp-action-edit"
                                    class="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                                    @click="runAction('Edit')">
                                    <Icon name="ion:create-outline" class="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                <button type="button" data-testid="ttp-action-delete"
                                    class="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                                    @click="runAction('Delete')">
                                    <Icon name="ion:trash" class="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Summary / Employees (existing compact tab row with bottom indicator) -->
                    <div class="px-4 pt-1" data-testid="ttp-detail-tabs">
                        <UiTabs v-model="detailTab" :tabs="detailTabs" color="#4aff7a" />
                    </div>

                    <!-- Summary: flat sections separated by subtle dividers -->
                    <div v-if="detailTab === 0" class="px-4 py-4" data-testid="ttp-summary">
                        <section v-for="(section, si) in selected.summarySections" :key="section.id"
                            :class="si > 0 ? 'border-t border-white/10 mt-4 pt-4' : ''"
                            :data-testid="`ttp-section-${section.id}`">
                            <div class="flex items-center gap-2 mb-3">
                                <Icon :name="section.icon" class="text-base text-emerald-300" />
                                <h3 class="text-sm font-semibold text-white/85">{{ section.title }}</h3>
                            </div>

                            <!-- Flag rows (Capture Mode): icon + label list -->
                            <ul v-if="flagRows(section).length" class="flex flex-col gap-1.5">
                                <li v-for="row in flagRows(section)" :key="row.label"
                                    class="flex items-center gap-2 text-sm">
                                    <Icon :name="row.flag ? 'ion:checkmark-circle' : 'ion:close-circle'"
                                        :class="row.flag ? 'text-emerald-300' : 'text-rose-300'" />
                                    <span class="text-white/75">{{ row.label }}</span>
                                </li>
                            </ul>

                            <!-- Value rows: flat label/value pairs in a grid -->
                            <div v-else class="grid grid-cols-2 gap-x-6 gap-y-3">
                                <div v-for="row in valueRows(section)" :key="row.label" class="min-w-0">
                                    <div class="text-[10px] font-semibold uppercase tracking-wider text-white/45 mb-1">
                                        {{ row.label }}
                                    </div>
                                    <div class="text-sm font-medium text-white/90">{{ row.value }}</div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Employees (allocation not implemented yet) -->
                    <UiComingSoon v-else title="Employees"
                        description="Employee allocation for this policy will be available in a future phase."
                        testid="ttp-employees-coming-soon" />
                </template>

                <div v-else class="p-8 text-center text-sm text-white/50" data-testid="ttp-detail-empty">
                    Select a policy to view its details.
                </div>
            </div>

            <!-- Right: compact allocation support panel (top-aligned, lightweight) -->
            <div class="rounded-xl border border-white/10 bg-white/5 p-3.5 flex flex-col gap-2"
                data-testid="ttp-allocation-panel">
                <div data-testid="ttp-allocation-coming-soon" class="flex flex-col gap-2">
                    <div class="flex items-center gap-1.5">
                        <Icon name="ion:people-outline" class="text-sm text-emerald-300" />
                        <h3 class="text-sm font-semibold text-white/85">Policy Allocation</h3>
                    </div>
                    <p class="text-xs leading-relaxed text-white/55">
                        Rule-based and manual employee assignment will be available in a future phase.
                    </p>
                    <span
                        class="self-start rounded border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                        Coming Soon
                    </span>
                </div>
            </div>
        </div>

        <!-- Add Time Tracking Policy wizard (UI-only, temporary in-memory state) -->
        <AttendanceTimeTrackingPolicyWizard v-model="wizardOpen" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { timeTrackingPolicies, defaultTimeTrackingPolicyId } from '~/data/timeTrackingPolicy'

const toast = useToast()

const search = ref('')
const selectedId = ref(defaultTimeTrackingPolicyId)
const detailTab = ref(0)
const actionMenuOpen = ref(false)
const wizardOpen = ref(false)

const detailTabs = [
    { label: 'Summary', icon: 'ion:document-text-outline', testid: 'ttp-tab-summary' },
    { label: 'Employees', icon: 'ion:people-outline', testid: 'ttp-tab-employees' },
]

const filteredPolicies = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return timeTrackingPolicies
    return timeTrackingPolicies.filter(p => p.name.toLowerCase().includes(q))
})

const selected = computed(() => timeTrackingPolicies.find(p => p.id === selectedId.value) || null)

const flagRows = (section) => section.rows.filter(r => typeof r.flag === 'boolean')
const valueRows = (section) => section.rows.filter(r => r.value !== undefined)

const selectPolicy = (id) => {
    selectedId.value = id
    detailTab.value = 0
    actionMenuOpen.value = false
}

const onAction = (action) => {
    toast.info({
        title: 'Coming Soon',
        message: `${action} is not available for Time Tracking Policies yet.`,
        timeout: 3000,
    })
}

const runAction = (action) => {
    actionMenuOpen.value = false
    onAction(action)
}

const closeActionMenu = () => {
    actionMenuOpen.value = false
}

onMounted(() => document.addEventListener('click', closeActionMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeActionMenu))
</script>
