<template>
  <div class="flex flex-col gap-3">
    <!--
      LEAVE sub-view of Approvals Inbox (entityType LEAVE only).
      Other entity tabs (REGULARISATION / WORKDAY / EXIT) attach as:
        - badge-counted category tabs above this heading (see §0 pattern)
        - or a client-side entity_type switch that swaps the column set
      Do not wire other tabs until their column sets are defined.
    -->

    <!-- 1. Page heading — plain, left-aligned, no card -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <h1 class="text-lg font-semibold text-white/90">
        Pending leave approvals
        <span v-if="!loading && leaveTotal > 0"
          class="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full align-middle">
          {{ leaveTotal }}
        </span>
      </h1>
      <UiButton color="#fff" text="Reload" prepend-icon="ion:refresh" size="sm"
        :loading="loading" @click="load" />
    </div>

    <!-- 2. Filter bar — one row, same height -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="w-40">
        <FormSelect v-model="filters.department" :options="departmentOptions"
          placeholder="Department" size="sm" color="#fff" clearable />
      </div>
      <!-- Location: only shown when enrichment produced values (schema has location on employee, not on approval payload) -->
      <div v-if="locationOptions.length" class="w-40">
        <FormSelect v-model="filters.location" :options="locationOptions"
          placeholder="Location" size="sm" color="#fff" clearable />
      </div>
      <div class="w-40">
        <FormSelect v-model="filters.leaveType" :options="leaveTypeOptions"
          placeholder="Leave Type" size="sm" color="#fff" clearable />
      </div>
      <div class="w-36">
        <FormSelect v-model="filters.status" :options="statusOptions"
          placeholder="Leave Status" size="sm" color="#fff" clearable />
      </div>
      <!-- Leave Duration (date range) — same height as FormSelect size=sm (py-1.5) -->
      <div class="flex items-center gap-1">
        <div class="w-36">
          <input v-model="filters.dateFrom" type="date" aria-label="Duration from"
            class="w-full rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 [color-scheme:dark] focus:outline-none focus:border-white/30" />
        </div>
        <span class="text-white/40 text-xs">–</span>
        <div class="w-36 relative">
          <input v-model="filters.dateTo" type="date" aria-label="Duration to"
            class="w-full rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 pr-8 text-xs text-white/80 [color-scheme:dark] focus:outline-none focus:border-white/30" />
          <Icon name="ion:calendar-outline"
            class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 text-sm" />
        </div>
      </div>
      <!-- Search pinned far right -->
      <div class="flex-1 min-w-[10rem] max-w-xs ml-auto">
        <FormInput v-model="filters.search" placeholder="Search employee…" size="sm"
          color="#fff" prepend-icon="lucide:search" clearable />
      </div>
    </div>

    <!-- 3. Action row -->
    <div class="flex items-center gap-3 flex-wrap">
      <label class="flex items-center gap-2 text-xs text-white/60 select-none cursor-pointer">
        <input type="checkbox" :checked="allOnPageSelected" :indeterminate.prop="someOnPageSelected"
          @change="toggleAllOnPage" class="accent-[#4aff7a]" />
        <span>Select all</span>
      </label>
      <UiButton color="#4aff7a" text="Approve" size="sm" prepend-icon="ion:checkmark-circle"
        :disabled="!selectedIds.length" :loading="bulkLoading" @click="bulkApprove" />
      <UiButton color="#ff4a4a" text="Reject" size="sm" prepend-icon="ion:close-circle"
        :disabled="!selectedIds.length" :loading="bulkLoading" @click="openBulkReject" />
      <div class="flex-1" />
      <span class="text-xs text-white/50">Total: {{ leaveTotal }}</span>
      <!-- Column options -->
      <div class="relative">
        <button type="button" aria-label="Column options"
          class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          @click="showColumnMenu = !showColumnMenu">
          <Icon name="lucide:columns-3" class="w-4 h-4" />
        </button>
        <div v-if="showColumnMenu"
          class="absolute right-0 z-30 mt-1 w-52 rounded-lg border border-white/15 bg-[#1a1d27] shadow-xl p-2">
          <label v-for="col in optionalColumns" :key="col.key"
            class="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-white/70 hover:bg-white/5 cursor-pointer">
            <input type="checkbox" :checked="visibleColumns[col.key]" @change="visibleColumns[col.key] = !visibleColumns[col.key]"
              class="accent-[#4aff7a]" />
            {{ col.label }}
          </label>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading && !rows.length"
      class="rounded-lg border border-white/15 bg-white/5 py-12 text-center">
      <Icon name="lucide:loader-2" class="w-6 h-6 text-white/40 animate-spin mx-auto mb-2" />
      <p class="text-sm text-white/50">Loading pending leave approvals…</p>
    </div>

    <!-- Empty state (no LEAVE at all) -->
    <div v-else-if="!leaveApprovals.length"
      class="rounded-lg border border-white/15 bg-white/5 py-12 text-center">
      <Icon name="ion:checkmark-circle-outline" class="w-8 h-8 text-emerald-400/70 mx-auto mb-2" />
      <p class="text-sm text-white/60">No pending leave approvals</p>
      <p class="text-xs text-white/40 mt-1">New leave requests awaiting review will appear here.</p>
    </div>

    <!-- Empty state (filters exclude everything) -->
    <div v-else-if="!filteredRows.length"
      class="rounded-lg border border-white/15 bg-white/5 py-12 text-center">
      <Icon name="lucide:search-x" class="w-8 h-8 text-white/40 mx-auto mb-2" />
      <p class="text-sm text-white/60">No leave requests match these filters</p>
      <button type="button" class="mt-2 text-xs text-[#4aff7a] hover:underline" @click="resetFilters">
        Clear filters
      </button>
    </div>

    <!-- 4. Table -->
    <div v-else class="rounded-lg border border-white/15 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[960px]">
          <thead>
            <tr class="bg-white/5 border-b border-white/10">
              <th class="px-3 py-2.5 text-left w-10">
                <input type="checkbox" :checked="allOnPageSelected" :indeterminate.prop="someOnPageSelected"
                  @change="toggleAllOnPage" class="accent-[#4aff7a]" aria-label="Select page" />
              </th>
              <th class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Employee</th>
              <th v-if="visibleColumns.employeeNumber" class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Employee Number</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Department</th>
              <th v-if="visibleColumns.location" class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Location</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Leave Dates</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Leave Type</th>
              <th class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Request Status</th>
              <th v-if="visibleColumns.lastAction" class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Last Action By</th>
              <th v-if="visibleColumns.nextApprovers" class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Next Approvers</th>
              <th v-if="visibleColumns.leaveNote" class="px-3 py-2.5 text-left text-xs font-medium text-white/60">Leave Note</th>
              <th class="px-3 py-2.5 text-right text-xs font-medium text-white/60 w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id"
              class="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td class="px-3 py-2.5">
                <input type="checkbox" :checked="selectedIds.includes(row.id)"
                  @change="toggleSelect(row.id)" class="accent-[#4aff7a]" :aria-label="`Select ${row.employeeName}`" />
              </td>
              <td class="px-3 py-2.5">
                <NuxtLink :to="employeeLink(row)"
                  class="text-[#4aff7a] hover:underline text-xs font-medium leading-tight block">
                  {{ row.employeeName }}
                </NuxtLink>
                <span class="text-white/40 text-[10px]">{{ row.role || '—' }}</span>
              </td>
              <td v-if="visibleColumns.employeeNumber" class="px-3 py-2.5 text-white/70 text-xs">
                {{ row.employeeNumber || '—' }}
              </td>
              <td class="px-3 py-2.5 text-white/70 text-xs">{{ row.department || '—' }}</td>
              <td v-if="visibleColumns.location" class="px-3 py-2.5 text-white/70 text-xs">
                {{ row.location || '—' }}
              </td>
              <td class="px-3 py-2.5">
                <div class="text-white/80 text-xs">{{ row.dateLabel }}</div>
                <div class="text-white/40 text-[10px]">{{ row.dayCount }} day{{ row.dayCount === 1 ? '' : 's' }}</div>
              </td>
              <td class="px-3 py-2.5">
                <div class="text-white/80 text-xs">{{ row.leaveType || '—' }}</div>
                <div class="text-white/40 text-[10px]">Requested on {{ row.requestedOn }}</div>
              </td>
              <td class="px-3 py-2.5">
                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                  :class="statusBadgeClass(row.leaveStatus)">
                  {{ row.leaveStatus || row.instanceStatus }}
                </span>
              </td>
              <td v-if="visibleColumns.lastAction" class="px-3 py-2.5 text-white/70 text-xs">
                {{ row.lastActionBy || '—' }}
              </td>
              <td v-if="visibleColumns.nextApprovers" class="px-3 py-2.5 text-white/70 text-xs max-w-[140px]">
                {{ row.nextApprovers || '—' }}
              </td>
              <td v-if="visibleColumns.leaveNote" class="px-3 py-2.5 text-white/50 text-xs max-w-[160px] truncate"
                :title="row.note">
                {{ row.note || '—' }}
              </td>
              <td class="px-3 py-2.5">
                <div class="flex items-center justify-end gap-1 relative">
                  <button type="button" title="Approve" aria-label="Approve"
                    class="p-1 rounded text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    :disabled="row.busy" @click="approveRow(row)">
                    <Icon name="ion:checkmark-circle" class="w-4 h-4" />
                  </button>
                  <button type="button" title="Reject" aria-label="Reject"
                    class="p-1 rounded text-red-400 hover:bg-red-500/20 transition-colors"
                    :disabled="row.busy" @click="openReject(row)">
                    <Icon name="ion:x-circle" class="w-4 h-4" />
                  </button>
                  <button type="button" title="More actions" aria-label="More actions"
                    class="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    @click.stop="toggleRowMenu(row.id)">
                    <Icon name="ion:ellipsis-horizontal" class="w-4 h-4" />
                  </button>
                  <!-- ⋯ popover -->
                  <div v-if="rowMenuId === row.id"
                    class="absolute right-0 top-7 z-30 w-48 rounded-lg border border-white/15 bg-[#1a1d27] shadow-xl py-1">
                    <button type="button"
                      class="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5"
                      @click="openMenuAction(row, 'comment')">
                      Add Comment
                    </button>
                    <button type="button"
                      class="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5"
                      @click="openMenuAction(row, 'type')">
                      Change Leave Type
                    </button>
                    <button type="button"
                      class="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/5"
                      @click="openMenuAction(row, 'dates')">
                      Change Leave Dates
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 6. Pagination bottom-right -->
    <div v-if="filteredRows.length"
      class="flex items-center justify-end gap-3 text-xs text-white/50">
      <span>
        {{ rangeStart }} to {{ rangeEnd }} of {{ filteredRows.length }}
        · Page {{ page }} of {{ totalPages }}
      </span>
      <div class="flex items-center gap-1">
        <button type="button" class="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
          :disabled="page <= 1" aria-label="First page" @click="goPage(1)">
          <Icon name="lucide:chevrons-left" class="w-3.5 h-3.5" />
        </button>
        <button type="button" class="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
          :disabled="page <= 1" aria-label="Previous page" @click="goPage(page - 1)">
          <Icon name="lucide:chevron-left" class="w-3.5 h-3.5" />
        </button>
        <button type="button" class="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
          :disabled="page >= totalPages" aria-label="Next page" @click="goPage(page + 1)">
          <Icon name="lucide:chevron-right" class="w-3.5 h-3.5" />
        </button>
        <button type="button" class="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
          :disabled="page >= totalPages" aria-label="Last page" @click="goPage(totalPages)">
          <Icon name="lucide:chevrons-right" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Reject (single) -->
    <UiModal v-model="rejectModal" title="Reject leave request" size="sm">
      <template #default>
        <p class="text-xs text-white/60 mb-2">
          Rejecting <strong class="text-white/80">{{ rejectTarget?.employeeName }}</strong>'s leave
          ({{ rejectTarget?.leaveType }} · {{ rejectTarget?.dateLabel }}).
        </p>
        <FormInputArea v-model="rejectReason" placeholder="Reason (required)" color="#fff" :rows="3" />
      </template>
      <template #footer>
        <UiButton color="#fff" text="Cancel" size="sm" @click="rejectModal = false" />
        <UiButton color="#ff4a4a" text="Reject" size="sm" :loading="actionLoading" @click="confirmReject" />
      </template>
    </UiModal>

    <!-- Bulk reject -->
    <UiModal v-model="bulkRejectModal" title="Reject selected leave requests" size="sm">
      <template #default>
        <p class="text-xs text-white/60 mb-2">Reject {{ selectedIds.length }} selected request(s).</p>
        <FormInputArea v-model="rejectReason" placeholder="Reason (required)" color="#fff" :rows="3" />
      </template>
      <template #footer>
        <UiButton color="#fff" text="Cancel" size="sm" @click="bulkRejectModal = false" />
        <UiButton color="#ff4a4a" text="Reject all" size="sm" :loading="bulkLoading" @click="confirmBulkReject" />
      </template>
    </UiModal>

    <!-- ⋯ menu actions (comment / type / dates) — existing PATCH /leave/requests/:id -->
    <UiModal v-model="editModal" :title="editTitle" size="md">
      <template #default>
        <div class="space-y-3">
          <p class="text-xs text-white/50">
            {{ editTarget?.employeeName }} · {{ editTarget?.leaveType }}
          </p>

          <template v-if="editMode === 'comment'">
            <label class="block text-xs font-medium text-white/60 mb-1">Comment</label>
            <FormInputArea v-model="editForm.reason" placeholder="Add a comment on this leave request" color="#fff" :rows="3" />
          </template>

          <template v-else-if="editMode === 'type'">
            <label class="block text-xs font-medium text-white/60 mb-1">Leave Type</label>
            <FormSelect v-model="editForm.leave_type_id" :options="leaveTypeSelectOptions"
              placeholder="Select leave type" color="#fff" clearable />
          </template>

          <template v-else-if="editMode === 'dates'">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-white/60 mb-1">Start Date</label>
                <input v-model="editForm.start_date" type="date"
                  class="h-9 w-full rounded-2xl border border-white/15 bg-white/10 px-3 text-xs text-white/80 [color-scheme:dark] focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label class="block text-xs font-medium text-white/60 mb-1">End Date</label>
                <input v-model="editForm.end_date" type="date"
                  class="h-9 w-full rounded-2xl border border-white/15 bg-white/10 px-3 text-xs text-white/80 [color-scheme:dark] focus:outline-none focus:border-white/30" />
              </div>
            </div>
          </template>
        </div>
      </template>
      <template #footer>
        <UiButton color="#fff" text="Cancel" size="sm" @click="editModal = false" />
        <UiButton color="#4aff7a" text="Save" size="sm" :loading="actionLoading" @click="saveEdit" />
      </template>
    </UiModal>

    <!-- Click-away for popovers -->
    <div v-if="showColumnMenu || rowMenuId" class="fixed inset-0 z-20" @click="closePopovers" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useApprovalStore } from '~/stores/organization/approval.store'
import { useLeaveRequestStore } from '~/stores/organization/leaveRequest.store'
import { useLeaveTypeStore } from '~/stores/organization/leaveType.store'
import { useAuthStore } from '~/stores/shared/auth.store'

const emit = defineEmits(['refresh'])

const approvalStore = useApprovalStore()
const leaveStore = useLeaveRequestStore()
const leaveTypeStore = useLeaveTypeStore()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const actionLoading = ref(false)
const bulkLoading = ref(false)

const leaveApprovals = ref([])
const empEnrich = ref(new Map()) // employee_id -> { employee_code, location_name }

const selectedIds = ref([])
const page = ref(1)
const pageSize = 10

const filters = reactive({
  department: '',
  location: '',
  leaveType: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  search: '',
})

const optionalColumns = [
  { key: 'employeeNumber', label: 'Employee Number' },
  { key: 'location', label: 'Location' },
  { key: 'lastAction', label: 'Last Action By' },
  { key: 'nextApprovers', label: 'Next Approvers' },
  { key: 'leaveNote', label: 'Leave Note' },
]
const visibleColumns = reactive({
  employeeNumber: true,
  location: true,
  lastAction: true,
  nextApprovers: true,
  leaveNote: true,
})
const showColumnMenu = ref(false)
const rowMenuId = ref(null)

const rejectModal = ref(false)
const bulkRejectModal = ref(false)
const rejectTarget = ref(null)
const rejectReason = ref('')

const editModal = ref(false)
const editMode = ref('') // comment | type | dates
const editTarget = ref(null)
const editForm = reactive({ reason: '', leave_type_id: '', start_date: '', end_date: '' })

const route = useRoute()
const approverId = computed(() => authStore.admin?.id || authStore.employee || '')
// Super-admin org_id can be '' — prefer route org so pending/approvals APIs get a valid ObjectId
const organizationId = computed(() =>
  String(route.params.organization || '') ||
  authStore.admin?.organization_id ||
  authStore.organization ||
  ''
)

const editTitle = computed(() => ({
  comment: 'Add Comment',
  type: 'Change Leave Type',
  dates: 'Change Leave Dates',
}[editMode.value] || 'Edit Leave'))

/* ---------- derive filter options from loaded data ---------- */
const departmentOptions = computed(() => {
  const set = new Set(leaveApprovals.value.map(r => r.department).filter(Boolean))
  return [...set].sort().map(d => ({ label: d, value: d }))
})

const locationOptions = computed(() => {
  const set = new Set(leaveApprovals.value.map(r => r.location).filter(Boolean))
  return [...set].sort().map(d => ({ label: d, value: d }))
})

const leaveTypeOptions = computed(() => {
  const set = new Set(leaveApprovals.value.map(r => r.leaveType).filter(Boolean))
  return [...set].sort().map(d => ({ label: d, value: d }))
})

const statusOptions = computed(() => {
  const set = new Set(
    leaveApprovals.value
      .map(r => r.leaveStatus || r.instanceStatus)
      .filter(Boolean)
  )
  return [...set].sort().map(d => ({ label: d, value: d }))
})

const leaveTypeSelectOptions = computed(() =>
  (leaveTypeStore.leaveTypes || []).map(lt => ({ label: lt.name, value: lt.id }))
)

/* ---------- filter + paginate ---------- */
const leaveTotal = computed(() => leaveApprovals.value.length)

const filteredRows = computed(() => {
  const q = filters.search.trim().toLowerCase()
  const from = filters.dateFrom ? new Date(filters.dateFrom + 'T00:00:00') : null
  const to = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59') : null

  return leaveApprovals.value.filter((row) => {
    if (filters.department && row.department !== filters.department) return false
    if (filters.location && row.location !== filters.location) return false
    if (filters.leaveType && row.leaveType !== filters.leaveType) return false
    if (filters.status && (row.leaveStatus || row.instanceStatus) !== filters.status) return false

    if (from || to) {
      const start = new Date(row.startRaw)
      const end = new Date(row.endRaw)
      if (from && end < from) return false
      if (to && start > to) return false
    }

    if (q) {
      const hay = [
        row.employeeName,
        row.employeeNumber,
        row.note,
        row.leaveType,
        row.department,
      ].join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)))

const rows = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

const rangeStart = computed(() =>
  filteredRows.value.length ? (page.value - 1) * pageSize + 1 : 0
)
const rangeEnd = computed(() =>
  Math.min(page.value * pageSize, filteredRows.value.length)
)

const allOnPageSelected = computed(() =>
  rows.value.length > 0 && rows.value.every(r => selectedIds.value.includes(r.id))
)
const someOnPageSelected = computed(() =>
  rows.value.some(r => selectedIds.value.includes(r.id)) && !allOnPageSelected.value
)

watch(
  () => [filters.department, filters.location, filters.leaveType, filters.status, filters.dateFrom, filters.dateTo, filters.search],
  () => { page.value = 1; selectedIds.value = [] }
)

/* ---------- helpers ---------- */
function formatDay(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return String(d).slice(0, 10) }
}

function dayCountBetween(start, end) {
  if (!start || !end) return 0
  const s = new Date(start)
  const e = new Date(end)
  const ms = e.setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0)
  return Math.floor(ms / 86400000) + 1
}

function statusBadgeClass(status) {
  const map = {
    PENDING: 'bg-amber-500/20 text-amber-400',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
    APPROVED: 'bg-emerald-500/20 text-emerald-400',
    COMPLETED: 'bg-emerald-500/20 text-emerald-400',
    REJECTED: 'bg-red-500/20 text-red-400',
    CANCELLED: 'bg-white/10 text-white/50',
  }
  return map[status] || 'bg-white/10 text-white/60'
}

function nextApproversFor(item) {
  const flow = approvalStore.flows.find(f => f.id === item.flow_id)
  if (!flow) return ''
  const level = (flow.levels || []).find(l => l.level === item.current_level)
  if (!level?.approvers?.length) return ''
  return level.approvers
    .map(a => a.employee?.full_name || a.role || a.user_id)
    .filter(Boolean)
    .join(', ')
}

function lastActionBy(item) {
  const logs = item.logs || []
  const acted = [...logs].reverse().find(l => l.action && l.action !== 'INITIATED')
  if (!acted) return ''
  return acted.approver?.full_name || acted.approver_id || acted.action
}

function mapRow(item) {
  const leave = item.leave || {}
  const empId = leave.employee_id || item.employee?.id || ''
  const enrich = empEnrich.value.get(empId) || {}
  const start = leave.start_date
  const end = leave.end_date
  return {
    id: item.id,
    leaveId: leave.id,
    employeeId: empId,
    employeeName: item.employee?.full_name || 'Unknown',
    role: item.employee?.designation_name || '',
    employeeNumber: enrich.employee_code || '',
    department: item.employee?.department_name || '',
    location: enrich.location_name || '',
    leaveType: leave.leave_type_name || '',
    leaveTypeId: leave.leave_type_id || '',
    leaveStatus: leave.status || '',
    instanceStatus: item.status || '',
    startRaw: start,
    endRaw: end,
    dateLabel: start
      ? (start.slice(0, 10) === end?.slice(0, 10)
        ? formatDay(start)
        : `${formatDay(start)} – ${formatDay(end)}`)
      : '—',
    dayCount: dayCountBetween(start, end),
    requestedOn: formatDay(item.created_at),
    note: leave.reason || '',
    lastActionBy: lastActionBy(item),
    nextApprovers: nextApproversFor(item),
    flowId: item.flow_id,
    busy: false,
  }
}

function employeeLink(row) {
  return `/organization/${organizationId.value}/organization/employees?employee_id=${row.employeeId}`
}

function resetFilters() {
  filters.department = ''
  filters.location = ''
  filters.leaveType = ''
  filters.status = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.search = ''
}

function goPage(p) {
  const clamped = Math.min(Math.max(1, p), totalPages.value)
  page.value = clamped
}

function toggleSelect(id) {
  const i = selectedIds.value.indexOf(id)
  if (i === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(i, 1)
}

function toggleAllOnPage() {
  if (allOnPageSelected.value) {
    const pageIds = new Set(rows.value.map(r => r.id))
    selectedIds.value = selectedIds.value.filter(id => !pageIds.has(id))
  } else {
    const set = new Set(selectedIds.value)
    rows.value.forEach(r => set.add(r.id))
    selectedIds.value = [...set]
  }
}

function closePopovers() {
  showColumnMenu.value = false
  rowMenuId.value = null
}

function toggleRowMenu(id) {
  rowMenuId.value = rowMenuId.value === id ? null : id
  showColumnMenu.value = false
}

/* ---------- load: all pending → LEAVE only → enrich ---------- */
async function load() {
  loading.value = true
  selectedIds.value = []
  page.value = 1
  const { $api } = useNuxtApp()
  try {
    // Page through pending (mixed entity types); keep LEAVE only
    const all = []
    let p = 1
    let totalPagesServer = 1
    do {
      const { data } = await $api.get('/approval/instances/pending', {
        params: {
          organization_id: organizationId.value,
          page: String(p),
          limit: '50',
        },
      })
      all.push(...(data.approvals || []))
      totalPagesServer = data.total_pages || 1
      p += 1
    } while (p <= totalPagesServer && p <= 20)

    // Enrich employees (code + location) first so mapRow can use them;
    // leave types + flows in parallel with that enrich
    await Promise.all([
      enrichEmployees($api).catch((e) => console.warn('[ApprovalsInbox] enrich failed', e)),
      leaveTypeStore.fetchLeaveTypes().catch(() => {}),
      approvalStore.fetchFlows('LEAVE').catch(() => {}),
    ])

    leaveApprovals.value = all
      .filter(a => a.entity_type === 'LEAVE')
      .map(mapRow)

    emit('refresh')
  } catch (e) {
    console.error('[ApprovalsInbox] load failed:', e)
    toast.error({ title: 'Failed to load', message: e?.message || 'Could not load approvals', timeout: 3000 })
    leaveApprovals.value = []
  } finally {
    loading.value = false
  }
}

async function enrichEmployees($api) {
  const { data } = await $api.get('/employees/all', {
    params: { organization_id: organizationId.value },
  })
  const map = new Map()
  for (const e of data?.employees || []) {
    map.set(e.id, {
      employee_code: e.employee_code || '',
      location_name: e.location_name || '',
    })
  }
  empEnrich.value = map
  // Re-map rows that loaded before enrich completed
  leaveApprovals.value = leaveApprovals.value.map(r => {
    const en = map.get(r.employeeId)
    if (!en) return r
    return {
      ...r,
      employeeNumber: en.employee_code || r.employeeNumber,
      location: en.location_name || r.location,
    }
  })
}

/* ---------- actions ---------- */
async function approveRow(row) {
  row.busy = true
  try {
    const res = await approvalStore.approve(row.id, approverId.value, '')
    if (res.success !== false) {
      toast.success({ title: 'Approved', message: `Leave for ${row.employeeName} approved`, timeout: 2000 })
      leaveApprovals.value = leaveApprovals.value.filter(r => r.id !== row.id)
      selectedIds.value = selectedIds.value.filter(id => id !== row.id)
      emit('refresh')
    } else {
      toast.error({ title: 'Approve failed', message: res.message || 'Unknown error', timeout: 3000 })
    }
  } finally {
    row.busy = false
  }
}

function openReject(row) {
  rejectTarget.value = row
  rejectReason.value = ''
  rejectModal.value = true
}

async function confirmReject() {
  if (!rejectReason.value.trim()) {
    toast.error({ title: 'Reason required', message: 'Please enter a rejection reason', timeout: 2500 })
    return
  }
  actionLoading.value = true
  try {
    const res = await approvalStore.reject(rejectTarget.value.id, approverId.value, rejectReason.value.trim())
    if (res.success !== false) {
      toast.success({ title: 'Rejected', message: `Leave for ${rejectTarget.value.employeeName} rejected`, timeout: 2000 })
      leaveApprovals.value = leaveApprovals.value.filter(r => r.id !== rejectTarget.value.id)
      selectedIds.value = selectedIds.value.filter(id => id !== rejectTarget.value.id)
      rejectModal.value = false
      emit('refresh')
    } else {
      toast.error({ title: 'Reject failed', message: res.message || 'Unknown error', timeout: 3000 })
    }
  } finally {
    actionLoading.value = false
  }
}

function openBulkReject() {
  rejectReason.value = ''
  bulkRejectModal.value = true
}

async function confirmBulkReject() {
  if (!rejectReason.value.trim()) {
    toast.error({ title: 'Reason required', message: 'Please enter a rejection reason', timeout: 2500 })
    return
  }
  bulkLoading.value = true
  try {
    await approvalStore.bulkAction(selectedIds.value, 'REJECT', approverId.value, rejectReason.value.trim())
    const gone = new Set(selectedIds.value)
    leaveApprovals.value = leaveApprovals.value.filter(r => !gone.has(r.id))
    selectedIds.value = []
    bulkRejectModal.value = false
    toast.success({ title: 'Rejected', message: 'Selected leave requests rejected', timeout: 2000 })
    emit('refresh')
  } finally {
    bulkLoading.value = false
  }
}

async function bulkApprove() {
  bulkLoading.value = true
  try {
    await approvalStore.bulkAction(selectedIds.value, 'APPROVE', approverId.value, '')
    const gone = new Set(selectedIds.value)
    leaveApprovals.value = leaveApprovals.value.filter(r => !gone.has(r.id))
    selectedIds.value = []
    toast.success({ title: 'Approved', message: 'Selected leave requests approved', timeout: 2000 })
    emit('refresh')
  } finally {
    bulkLoading.value = false
  }
}

function openMenuAction(row, mode) {
  editTarget.value = row
  editMode.value = mode
  editForm.reason = mode === 'comment' ? (row.note || '') : ''
  editForm.leave_type_id = mode === 'type' ? (row.leaveTypeId || '') : ''
  editForm.start_date = mode === 'dates' && row.startRaw ? row.startRaw.slice(0, 10) : ''
  editForm.end_date = mode === 'dates' && row.endRaw ? row.endRaw.slice(0, 10) : ''
  rowMenuId.value = null
  editModal.value = true
}

async function saveEdit() {
  if (!editTarget.value) return
  actionLoading.value = true
  try {
    const payload = { employee_id: editTarget.value.employeeId }
    if (editMode.value === 'comment') {
      if (!editForm.reason.trim()) {
        toast.error({ title: 'Required', message: 'Comment cannot be empty', timeout: 2500 })
        actionLoading.value = false
        return
      }
      payload.reason = editForm.reason.trim()
    } else if (editMode.value === 'type') {
      if (!editForm.leave_type_id) {
        toast.error({ title: 'Required', message: 'Select a leave type', timeout: 2500 })
        actionLoading.value = false
        return
      }
      payload.leave_type_id = editForm.leave_type_id
    } else if (editMode.value === 'dates') {
      if (!editForm.start_date || !editForm.end_date) {
        toast.error({ title: 'Required', message: 'Both dates are required', timeout: 2500 })
        actionLoading.value = false
        return
      }
      payload.start_date = editForm.start_date
      payload.end_date = editForm.end_date
    }

    const res = await leaveStore.edit(editTarget.value.leaveId, payload)
    if (res.success) {
      toast.success({ title: 'Updated', message: 'Leave request updated', timeout: 2000 })
      editModal.value = false
      await load()
    } else {
      toast.error({ title: 'Update failed', message: res.error || 'Could not update leave', timeout: 3000 })
    }
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  load()
})
</script>
