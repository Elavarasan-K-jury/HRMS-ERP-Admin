<template>
    <div class="flex flex-col gap-3 p-2" data-testid="rotation-roster">
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
                <h3 class="text-lg font-semibold text-white">Shift Rotation / Roster</h3>
                <p class="text-xs text-white/45 mt-0.5">Employees grouped by the shift assigned for the selected effective date. Select employees to move or swap. Rotation applies to all employees in the 3 shift groups.</p>
            </div>
            <span class="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded">{{ employees.length }} employee<span v-if="employees.length !== 1">s</span></span>
        </div>

        <div class="relative z-20 flex flex-wrap items-center gap-2 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg px-4 py-3">
            <div class="relative min-w-[220px] flex-1">
                <Icon name="ion:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/40" />
                <input v-model="search" data-testid="rotation-search" type="text" placeholder="Search employees..."
                    class="w-full rounded-lg border border-white/15 bg-black/20 py-2 pl-10 pr-3 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-emerald-300/60" />
            </div>
            <select v-model="shiftFilter" data-testid="rotation-shift-filter"
                class="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none transition focus:border-emerald-300/60 min-w-[170px]">
                <option value="">Shift: All</option>
                <option v-for="s in shiftOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
                <option value="none">No Shift Assigned</option>
            </select>
            <label class="flex items-center gap-1.5 text-xs text-white/60 select-none">
                <span class="whitespace-nowrap">Effective date</span>
                <input v-model="effectiveDate" data-testid="rotation-effective-date" type="date"
                    class="rounded-lg border border-white/15 bg-black/20 px-2 py-1.5 text-sm text-white/90 outline-none transition focus:border-emerald-300/60" />
            </label>
            <label class="flex items-center gap-2 text-xs text-white/60 select-none cursor-pointer">
                <input type="checkbox" data-testid="rotation-select-all" :checked="allSelected" :indeterminate.prop="someSelected"
                    @change="toggleAll" class="accent-[#4aff7a]" />
                <span>Select all</span>
            </label>
            <UiButton size="xs" color="#4aff7a" text="Reset" prepend-icon="ion:close-circle-outline"
                @click="resetFilters" :disabled="!hasActiveFilters" />
            <UiButton size="xs" color="#4aff7a" text="Rotate" prepend-icon="lucide:refresh-cw"
                data-testid="rotation-action-rotate" @click="openRotate" />
            <UiButton size="xs" color="#4aff7a" text="Export XLSX" prepend-icon="lucide:download"
                data-testid="rotation-export-all" @click="exportAllRoster" />
        </div>

        <div v-if="error && !loading" data-testid="rotation-error"
            class="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center justify-between gap-3">
            <span>{{ error }}</span>
            <button class="text-xs underline text-rose-200 hover:text-white" @click="load">Retry</button>
        </div>

        <div v-else-if="!loading && isEmpty" data-testid="rotation-empty"
            class="rounded-lg border border-white/15 bg-white/10 px-4 py-10 flex flex-col items-center justify-center gap-2 text-white/70">
            <Icon name="lucide:inbox" class="w-6 h-6 opacity-80" />
            <span>No employees found</span>
            <UiButton v-if="hasActiveFilters" size="xs" color="#4aff7a" text="Clear filters"
                prepend-icon="ion:close-circle-outline" @click="resetFilters" />
        </div>

        <div v-else-if="loading" data-testid="rotation-loading" class="flex flex-col gap-2">
            <div class="h-12 rounded-lg bg-white/5 animate-pulse" />
            <div class="h-12 rounded-lg bg-white/5 animate-pulse" />
            <div class="h-12 rounded-lg bg-white/5 animate-pulse" />
            <div class="h-12 rounded-lg bg-white/5 animate-pulse" />
        </div>

        <template v-else>
            <div v-if="selectedIds.length" data-testid="rotation-action-bar"
                class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
                <span data-testid="rotation-selected-count" class="text-sm text-white/85">
                    {{ selectedIds.length }} employee{{ selectedIds.length === 1 ? '' : 's' }} selected
                </span>
                <span data-testid="rotation-swap-hint" class="text-xs"
                    :class="selectedIds.length === 2 ? 'text-emerald-300/90' : 'text-white/50'">
                    {{ selectedIds.length === 2
                        ? 'Swap ready — exactly two employees selected'
                        : 'Swap requires exactly two employees' }}
                </span>
                <div class="flex flex-wrap items-center gap-2">
                    <UiButton size="sm" color="#4aff7a" text="Move" prepend-icon="lucide:arrow-right-circle"
                        data-testid="rotation-action-move" @click="openMove" />
                    <UiButton size="sm" color="#4aff7a" text="Swap" prepend-icon="lucide:arrow-left-right"
                        data-testid="rotation-action-swap" :disabled="selectedIds.length !== 2" @click="openSwap" />
                    <UiButton size="sm" color="#fff" text="Clear" prepend-icon="ion:close-circle-outline"
                        data-testid="rotation-clear-selection" @click="clearSelection" />
                </div>
            </div>

            <section v-for="g in groups" :key="g.key" data-testid="rotation-group"
                :data-shift-id="g.shiftId" :data-shift-name="g.label"
                class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
                <div class="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
                    <input type="checkbox" data-testid="rotation-group-select" :data-shift-name="g.label"
                        :checked="groupAllSelected(g)" :indeterminate.prop="groupSomeSelected(g)"
                        @change="toggleGroup(g)" class="accent-[#4aff7a]" />
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-semibold text-white/90 truncate">{{ g.label }}</p>
                        <p v-if="g.shift" class="text-[11px] text-white/45">
                            {{ g.shift.timings }}<template v-if="g.shift.shiftType === 'flexible'"> · Flexible</template><template v-else-if="g.shift.breakMinutes"> · {{ g.shift.breakMinutes }} min break</template>
                        </p>
                    </div>
                    <span class="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded">
                        {{ g.employees.length }} employee{{ g.employees.length === 1 ? '' : 's' }}
                    </span>
                    <button data-testid="rotation-group-export" :data-shift-name="g.label"
                        :title="`Export ${g.label}`" @click.stop="exportGroup(g)"
                        class="p-1 rounded text-white/40 hover:text-emerald-300 hover:bg-white/10 transition-colors">
                        <Icon name="lucide:download" class="w-3.5 h-3.5" />
                    </button>
                </div>

                <p v-if="!g.employees.length" data-testid="rotation-group-empty"
                    class="px-4 py-6 text-sm text-white/45 text-center">No employees assigned</p>

                <ul v-else>
                    <li v-for="emp in g.employees" :key="emp.id"
                        class="flex flex-wrap items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                        <input type="checkbox" data-testid="rotation-row-select" :data-emp-id="emp.id"
                            :checked="selectedIds.includes(emp.id)" @change="toggleRow(emp.id)" class="accent-[#4aff7a]" />
                        <div class="flex items-center gap-2.5 min-w-0 w-56">
                            <div class="shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-semibold">
                                {{ initials(emp) }}
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm text-white/90 truncate">{{ emp.full_name || '—' }}</p>
                                <p class="text-xs text-white/45 truncate">{{ emp.employee_code || '—' }}</p>
                            </div>
                        </div>
                        <span class="text-xs text-white/60 w-40 truncate">{{ emp.department_name || '—' }}</span>
                        <span class="text-xs text-white/50 w-36 truncate hidden sm:block">{{ emp.location_name || '—' }}</span>
                        <span data-testid="rotation-assignment" :data-emp-id="emp.id"
                            :data-shift-id="assignmentShiftIdFor(emp)"
                            class="ml-auto text-xs px-2 py-0.5 rounded shrink-0"
                            :class="assignmentShiftIdFor(emp) ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/35'">
                            {{ assignmentLabelFor(emp) || 'Not assigned' }}
                        </span>
                        <span v-if="emp.current_weekly_off" data-testid="rotation-weekly-off"
                            :data-emp-id="emp.id"
                            class="text-sky-400 bg-sky-500/10 text-xs px-2 py-0.5 rounded shrink-0">
                            {{ emp.current_weekly_off.name }}
                        </span>
                    </li>
                </ul>
            </section>
        </template>

        <MoveShiftModal v-model="moveOpen" :employees="resolvedSelection" :shifts="shiftOptions" @confirm="applyMove" />
        <SwapShiftModal v-model="swapOpen" :employees="resolvedSelection" @confirm="applySwap" />
        <RotateShiftModal v-model="rotateOpen" :employees="rotationScope" :shifts="shiftOptions"
            :assignments-by-emp="assignmentsByEmp" @confirm="applyRotate" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useShiftStore } from '~/stores/organization/shift.store'
import { useAuthStore } from '~/stores/shared/auth.store'
import MoveShiftModal from './MoveShiftModal.vue'
import SwapShiftModal from './SwapShiftModal.vue'
import RotateShiftModal from './RotateShiftModal.vue'
import * as XLSX from 'xlsx'
import {
    buildRosterGroups,
    buildShiftIndex,
    effectiveShiftIdFor,
    todayStr,
    ROSTER_EXPORT_COLUMNS,
    ROSTER_EXPORT_COL_WIDTHS,
    sheetNameFor,
    buildRosterExportRows,
    buildRosterExportSummaryAoa,
} from '~/data/shiftRotation'

const route = useRoute()
const authStore = useAuthStore()
const shiftStore = useShiftStore()

const orgId = computed(() => authStore.organization || route.params.organization || '')

const employees = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const shiftFilter = ref('')
const effectiveDate = ref(todayStr())
const selectedIds = ref([])
const overrides = ref({})
// EmployeeShiftAssignment rows fetched from the server (source of truth),
// keyed by employeeId. Resolved per effective date — no local assignment copies.
const assignmentsByEmp = ref(null)

const moveOpen = ref(false)
const swapOpen = ref(false)
const rotateOpen = ref(false)

const shiftsById = computed(() => buildShiftIndex(shiftStore.shifts))
const shiftOptions = computed(() => (shiftStore.shifts || []).filter(s => !s.deleted_at))
// Effective date used for resolution — an emptied date input falls back to today
// so grouping never silently loses its as-of context.
const dateStr = computed(() => effectiveDate.value || todayStr())

const roster = computed(() => buildRosterGroups({
    employees: employees.value,
    shifts: shiftStore.shifts || [],
    overrides: overrides.value,
    search: search.value,
    shiftFilter: shiftFilter.value,
    assignmentsByEmp: assignmentsByEmp.value,
    dateStr: dateStr.value,
}))

const groups = computed(() => roster.value.groups)
const isEmpty = computed(() => loading.value ? false : roster.value.isEmpty)

const hasActiveFilters = computed(() =>
    !!search.value || !!shiftFilter.value || effectiveDate.value !== todayStr())

const visibleIds = computed(() => roster.value.filteredEmployees.map(e => e.id))
const allSelected = computed(() =>
    visibleIds.value.length > 0 && visibleIds.value.every(id => selectedIds.value.includes(id)))
const someSelected = computed(() => {
    const c = visibleIds.value.filter(id => selectedIds.value.includes(id)).length
    return c > 0 && c < visibleIds.value.length
})

const resolvedSelection = computed(() => employees.value
    .filter(e => selectedIds.value.includes(e.id))
    .map(emp => {
        const sid = effectiveShiftIdFor(emp, overrides.value, assignmentsByEmp.value, dateStr.value)
        const shift = sid ? (shiftsById.value.get(sid) || emp.current_shift || null) : null
        return {
            id: emp.id,
            full_name: emp.full_name,
            employee_code: emp.employee_code,
            shiftId: sid || '',
            shiftName: shift?.name || '',
            current_weekly_off: emp.current_weekly_off || null,
        }
    }))

const rotationScope = computed(() => employees.value.map(emp => {
    const sid = effectiveShiftIdFor(emp, overrides.value, assignmentsByEmp.value, dateStr.value)
    const shift = sid ? (shiftsById.value.get(sid) || emp.current_shift || null) : null
    return {
        id: emp.id,
        full_name: emp.full_name,
        employee_code: emp.employee_code,
        shiftId: sid || '',
        shiftName: shift?.name || '',
        current_weekly_off: emp.current_weekly_off || null,
    }
}))

const initials = (emp) => {
    const name = emp?.full_name || ''
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '—'
}

// Right-side assignment status — resolved with the SAME as-of-date source
// (overrides + EmployeeShiftAssignment rows + selected effective date) that
// buildRosterGroups uses, so the pill can never disagree with the group.
const assignmentShiftIdFor = (emp) =>
    effectiveShiftIdFor(emp, overrides.value, assignmentsByEmp.value, dateStr.value)

const assignmentLabelFor = (emp) => {
    const sid = assignmentShiftIdFor(emp)
    if (!sid) return ''
    return shiftsById.value.get(sid)?.name || 'Shift'
}

function groupAllSelected(g) {
    const ids = g.employees.map(e => e.id)
    return ids.length > 0 && ids.every(id => selectedIds.value.includes(id))
}

function groupSomeSelected(g) {
    const ids = g.employees.map(e => e.id)
    const c = ids.filter(id => selectedIds.value.includes(id)).length
    return c > 0 && c < ids.length
}

function toggleRow(id) {
    const i = selectedIds.value.indexOf(id)
    if (i === -1) selectedIds.value = [...selectedIds.value, id]
    else selectedIds.value = selectedIds.value.filter(x => x !== id)
}

function toggleGroup(g) {
    const ids = g.employees.map(e => e.id)
    if (groupAllSelected(g)) {
        selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
    } else {
        selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
    }
}

function toggleAll() {
    if (allSelected.value) {
        const visible = new Set(visibleIds.value)
        selectedIds.value = selectedIds.value.filter(id => !visible.has(id))
    } else {
        selectedIds.value = [...new Set([...selectedIds.value, ...visibleIds.value])]
    }
}

function clearSelection() {
    selectedIds.value = []
}

function resetFilters() {
    search.value = ''
    shiftFilter.value = ''
    effectiveDate.value = todayStr()
    selectedIds.value = []
}

watch([search, shiftFilter, effectiveDate], () => {
    selectedIds.value = []
})

async function load() {
    if (!orgId.value) return
    loading.value = true
    error.value = ''
    try {
        const { $api } = useNuxtApp()
        const all = []
        let page = 1
        let total = Infinity
        while (all.length < total && page <= 50) {
            const { data } = await $api.get('/employees', {
                params: {
                    organization_id: orgId.value,
                    page,
                    limit: 100,
                    include_current_assignments: true,
                },
            })
            const rows = data?.employees || []
            all.push(...rows)
            total = Number(data?.total || 0)
            if (!rows.length) break
            page += 1
        }
        employees.value = all

        // All assignment rows for the org (past + future, soft-deleted excluded).
        // Grouping resolves these per effective date — EmployeeShiftAssignment
        // stays the single source of truth.
        const { data: asgData } = await $api.get('/shift-assignments')
        const map = new Map()
        for (const a of asgData?.assignments || []) {
            if (!a?.employee_id) continue
            if (!map.has(a.employee_id)) map.set(a.employee_id, [])
            map.get(a.employee_id).push({
                shiftId: a.shift_id,
                validFrom: a.valid_from || '',
                validTo: a.valid_to || '',
            })
        }
        assignmentsByEmp.value = map
    } catch (err) {
        console.error('[RotationRosterTab] load:', err)
        employees.value = []
        assignmentsByEmp.value = null
        error.value = err?.response?.data?.error || 'Failed to load employees'
    } finally {
        loading.value = false
    }
}

// ---- XLSX export -----------------------------------------------------

/** Complete (unfiltered) groups for the current effective date + live overrides. */
function completeExportGroups() {
    return buildRosterGroups({
        employees: employees.value,
        shifts: shiftStore.shifts || [],
        overrides: overrides.value,
        search: '',
        shiftFilter: '',
        assignmentsByEmp: assignmentsByEmp.value,
        dateStr: dateStr.value,
    }).groups
}

function sheetForRows(aoa) {
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = ROSTER_EXPORT_COL_WIDTHS.map(wch => ({ wch }))
    return ws
}

function slugForFile(label) {
    return sheetNameFor(label).replace(/\s+/g, '-').replace(/[^\w-]/g, '') || 'shift'
}

function exportAllRoster() {
    try {
        const gs = completeExportGroups()
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.aoa_to_sheet(buildRosterExportSummaryAoa({ groups: gs, dateStr: dateStr.value })),
            'Summary'
        )
        const used = new Set(['Summary'])
        for (const g of gs) {
            const aoa = [
                ROSTER_EXPORT_COLUMNS,
                ...buildRosterExportRows({ group: g, assignmentsByEmp: assignmentsByEmp.value, dateStr: dateStr.value }),
            ]
            const base = sheetNameFor(g.label)
            let name = base
            for (let i = 2; used.has(name); i++) name = `${base.slice(0, 28)} ${i}`
            used.add(name)
            XLSX.utils.book_append_sheet(wb, sheetForRows(aoa), name)
        }
        const filename = `shift-roster_${dateStr.value}.xlsx`
        XLSX.writeFile(wb, filename)
        useToast().success({ title: 'Export ready', message: filename })
    } catch (err) {
        console.error('[RotationRosterTab] exportAllRoster:', err)
        useToast().error({ title: 'Export failed', message: 'Could not build the XLSX file.' })
    }
}

function exportGroup(g) {
    try {
        const aoa = [
            ROSTER_EXPORT_COLUMNS,
            ...buildRosterExportRows({ group: g, assignmentsByEmp: assignmentsByEmp.value, dateStr: dateStr.value }),
        ]
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, sheetForRows(aoa), sheetNameFor(g.label))
        const filename = `shift-roster_${slugForFile(g.label)}_${dateStr.value}.xlsx`
        XLSX.writeFile(wb, filename)
        useToast().success({ title: 'Export ready', message: filename })
    } catch (err) {
        console.error('[RotationRosterTab] exportGroup:', err)
        useToast().error({ title: 'Export failed', message: 'Could not build the XLSX file.' })
    }
}

function openMove() {
    if (!selectedIds.value.length) return
    moveOpen.value = true
}

function openSwap() {
    // Swap requires EXACTLY two employees
    if (selectedIds.value.length !== 2) return
    swapOpen.value = true
}

function openRotate() {
    rotateOpen.value = true
}

async function applyMove(payload) {
    const results = payload.results || []
    const movedIds = results.length
        ? results.map(r => r.employee_id)
        : payload.employeeIds

    // Drop local preview overrides for employees the server actually moved
    const next = { ...overrides.value }
    for (const id of movedIds) delete next[id]
    overrides.value = next

    // Remove moved employees from the current selection
    selectedIds.value = selectedIds.value.filter(id => !movedIds.includes(id))

    const n = movedIds.length
    useToast().success({
        title: 'Shift moved',
        message: `${n} employee${n === 1 ? '' : 's'} moved to ${payload.shiftName}`,
    })

    // Refresh roster from server so assignments reflect the atomic move
    await load()
}

async function applySwap(payload) {
    const ids = payload?.employeeIds || []

    // Backend already persisted the swap — drop any local preview overrides
    // for the swapped employees so nothing local can masquerade as source of truth.
    const next = { ...overrides.value }
    for (const id of ids) delete next[id]
    overrides.value = next

    // Clear selection after a successful swap
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))

    useToast().success({
        title: 'Shifts swapped',
        message: `Shifts swapped for ${ids.length} employees effective ${payload.effectiveFrom}`,
    })

    // Refresh roster from the server — EmployeeShiftAssignment is the source of truth
    await load()
}

async function applyRotate(payload) {
    const ids = payload?.employeeIds || []

    // Backend persisted the rotation atomically — drop any local preview
    // overrides for rotated employees so nothing local can masquerade as source of truth.
    const next = { ...overrides.value }
    for (const id of ids) delete next[id]
    overrides.value = next

    // Remove rotated employees from the current selection
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))

    const n = payload?.affectedEmployeeCount ?? ids.length
    useToast().success({
        title: 'Rotation applied',
        message: `Rotation applied to ${n} employee${n === 1 ? '' : 's'} effective ${payload.effectiveFrom}`,
    })

    // Refresh roster from the server — EmployeeShiftAssignment is the source of truth
    await load()
}

onMounted(async () => {
    if (!orgId.value) return
    await Promise.all([
        shiftStore.fetchShifts(orgId.value),
        load(),
    ])
})
</script>
