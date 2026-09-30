<template>
  <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
    <!-- Header -->
    <div class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
      <h2 class="text-lg font-semibold uppercase text-white/90 capitalize">Leave</h2>
      <div class="flex items-center gap-2">
        <UiButton @click="activeTab = 'summary'" color="#fff" text="Summary" size="sm"
          :prepend-icon="activeTab === 'summary' ? 'ion:checkmark-circle' : 'ion:wallet-outline'" />
        <UiButton @click="activeTab = 'calendar'" color="#fff" text="Team Calendar" size="sm"
          :prepend-icon="activeTab === 'calendar' ? 'ion:checkmark-circle' : 'ion:calendar-outline'" />
        <UiButton @click="openRequestForm" color="#4aff7a" text="Request Leave" size="sm"
          prepend-icon="ion:add-circle" />
        <UiButton @click="load" color="#fff" prepend-icon="ion:refresh" :loading="leaveStore.loading" />
      </div>
    </div>

    <!-- ===== SUMMARY TAB ===== -->
    <template v-if="activeTab === 'summary'">
      <!-- Balance Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div v-for="bal in leaveStore.balances" :key="bal.leave_type_id"
          class="rounded-lg bg-white/10 border border-white/15 p-4 flex flex-col gap-1">
          <div class="text-xs text-white/50 uppercase font-medium">{{ bal.leave_type_name }}</div>
          <div class="text-2xl font-bold text-white/90">{{ bal.available != null ? bal.available : 'Unlimited' }}</div>
          <div class="text-[10px] text-white/40">
            Allocated: {{ bal.accrued != null ? bal.accrued : 'Unlimited' }} · Used: {{ bal.used }}
          </div>
        </div>
        <div v-if="!leaveStore.balances.length && !leaveStore.loading"
          class="col-span-full text-center text-white/40 py-6 text-sm">
          No leave balances found
        </div>
      </div>

      <!-- My Requests Table -->
      <div class="rounded-lg bg-white/10 border border-white/15 overflow-hidden">
        <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white/70">My Requests</h3>
        </div>
        <div v-if="!leaveStore.myRequests.length && !leaveStore.loading"
          class="text-center text-white/40 py-8 text-sm">
          No leave requests yet
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="bg-white/5 border-b border-white/10">
              <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Type</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Dates</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Days</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-white/60">Status</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-white/60">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in leaveStore.myRequests" :key="req.id"
              class="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td class="px-3 py-2 text-white/80 text-xs">{{ req.leave_type_name || 'Leave' }}</td>
              <td class="px-3 py-2 text-white/60 text-xs">
                {{ formatDate(req.start_date) }}
                <template v-if="req.start_date !== req.end_date"> – {{ formatDate(req.end_date) }}</template>
              </td>
              <td class="px-3 py-2 text-white/60 text-xs">{{ req.total_days || '-' }}</td>
              <td class="px-3 py-2">
                <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                  :class="statusBadge(req.status)">
                  {{ req.status }}
                </span>
              </td>
              <td class="px-3 py-2 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="isEditable(req)" @click="openEditForm(req)"
                    class="px-2 py-1 text-[10px] font-medium rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                    Edit
                  </button>
                  <button v-if="isCancellable(req)" @click="confirmCancel(req)"
                    class="px-2 py-1 text-[10px] font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ===== TEAM CALENDAR TAB ===== -->
    <template v-if="activeTab === 'calendar'">
      <div class="rounded-lg bg-white/10 border border-white/15 p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-white/70">Team Calendar — {{ calendarMonth }}</h3>
          <div class="flex items-center gap-2">
            <button @click="prevMonth"
              class="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-white/70 transition-colors">
              &larr; Prev
            </button>
            <button @click="nextMonth"
              class="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-white/70 transition-colors">
              Next &rarr;
            </button>
          </div>
        </div>
        <div v-if="!leaveStore.calendar.length && !leaveStore.loading"
          class="text-center text-white/40 py-8 text-sm">
          No team leave data for this month
        </div>
        <div v-else class="grid grid-cols-7 gap-1">
          <div v-for="day in calendarDays" :key="day.date"
            class="min-h-[60px] rounded-lg border border-white/10 p-1 text-[10px]"
            :class="day.isToday ? 'bg-white/15 border-white/30' : 'bg-white/5'">
            <div class="text-white/40 mb-1">{{ day.dayNum }}</div>
            <div v-for="entry in day.entries" :key="entry.date"
              class="rounded px-1 py-0.5 mb-0.5 text-[9px] truncate"
              :class="calendarEntryClass(entry.status)">
              {{ entry.leave_type_name || entry.status }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== REQUEST LEAVE MODAL ===== -->
    <UiModal v-model="leaveStore.showForm" title="Request Leave" :show-footer="false">
      <form @submit.prevent="submitRequest" class="space-y-4">
        <!-- Leave Type -->
        <div>
          <label class="block text-xs font-medium text-white/60 mb-1">Leave Type *</label>
          <select v-model="leaveStore.form.leave_type_id" required
            class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30">
            <option value="" disabled>Select leave type</option>
            <option v-for="lt in leaveTypeStore.leaveTypes" :key="lt.id" :value="lt.id">
              {{ lt.name }} ({{ lt.code }})
            </option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">Start Date *</label>
            <input type="date" v-model="leaveStore.form.start_date" required
              class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30" />
          </div>
          <div>
            <label class="block text-xs font-medium text-white/60 mb-1">End Date *</label>
            <input type="date" v-model="leaveStore.form.end_date" :min="leaveStore.form.start_date"
              class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/30" />
          </div>
        </div>

        <!-- Half Day Toggle -->
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="leaveStore.form.is_half_day"
              class="accent-[#4aff7a]" />
            <span class="text-xs text-white/70">Half Day</span>
          </label>
          <select v-if="leaveStore.form.is_half_day" v-model="leaveStore.form.half_day_type"
            class="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-white/30">
            <option value="FIRST_HALF">First Half (Morning)</option>
            <option value="SECOND_HALF">Second Half (Afternoon)</option>
          </select>
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-xs font-medium text-white/60 mb-1">Reason *</label>
          <textarea v-model="leaveStore.form.reason" required rows="3"
            class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
            placeholder="Reason for leave" />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-2">
          <UiButton type="submit" text="Submit Request" color="#4aff7a" class="flex-1"
            :loading="leaveStore.loading" />
          <UiButton text="Cancel" color="#fff" @click="leaveStore.showForm = false" />
        </div>
      </form>
    </UiModal>

    <!-- ===== CANCEL CONFIRM MODAL ===== -->
    <UiModal v-model="showCancelConfirm" title="Cancel Leave" :show-footer="false">
      <div class="space-y-4">
        <p class="text-xs text-white/60">
          Are you sure you want to cancel this leave request? This action cannot be undone.
        </p>
        <div>
          <label class="block text-xs font-medium text-white/60 mb-1">Cancellation Reason</label>
          <textarea v-model="cancelReason" rows="2"
            class="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30 resize-none"
            placeholder="Reason for cancellation (optional)" />
        </div>
        <div class="flex gap-2">
          <UiButton text="Confirm Cancel" color="#ff4a4a" @click="doCancel" :loading="leaveStore.loading"
            class="flex-1" />
          <UiButton text="Go Back" color="#fff" @click="showCancelConfirm = false" />
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLeaveRequestStore } from '~/stores/organization/leaveRequest.store'
import { useLeaveTypeStore } from '~/stores/organization/leaveType.store'

definePageMeta({ layout: 'organization' })

const leaveStore = useLeaveRequestStore()
const leaveTypeStore = useLeaveTypeStore()

const activeTab = ref('summary')
const showCancelConfirm = ref(false)
const cancelReason = ref('')
const cancelTargetId = ref(null)

// Calendar state
const calendarYear = ref(new Date().getFullYear())
const calendarMonthNum = ref(new Date().getMonth() + 1)

const calendarMonth = computed(() => {
  const d = new Date(calendarYear.value, calendarMonthNum.value - 1, 1)
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = calendarYear.value
  const month = calendarMonthNum.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const days = []
  const today = new Date().toISOString().slice(0, 10)

  // Pad start with empty days
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ date: `pad-${i}`, dayNum: '', entries: [], isToday: false })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const entries = leaveStore.calendar.filter((c) => c.date === dateStr)
    days.push({ date: dateStr, dayNum: d, entries, isToday: dateStr === today })
  }
  return days
})

function prevMonth() {
  if (calendarMonthNum.value === 1) {
    calendarMonthNum.value = 12
    calendarYear.value--
  } else {
    calendarMonthNum.value--
  }
  loadCalendar()
}

function nextMonth() {
  if (calendarMonthNum.value === 12) {
    calendarMonthNum.value = 1
    calendarYear.value++
  } else {
    calendarMonthNum.value++
  }
  loadCalendar()
}

function loadCalendar() {
  const mm = String(calendarMonthNum.value).padStart(2, '0')
  leaveStore.fetchCalendar(`${calendarYear.value}-${mm}`)
}

function formatDate(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

function statusBadge(status) {
  const map = {
    PENDING: 'bg-amber-500/20 text-amber-400',
    APPROVED: 'bg-emerald-500/20 text-emerald-400',
    REJECTED: 'bg-red-500/20 text-red-400',
    CANCELLED: 'bg-white/10 text-white/50',
  }
  return map[status] || 'bg-white/10 text-white/60'
}

function calendarEntryClass(status) {
  const map = {
    LEAVE: 'bg-blue-500/20 text-blue-400',
    APPROVED: 'bg-blue-500/20 text-blue-400',
    PENDING: 'bg-amber-500/20 text-amber-400',
    HOLIDAY: 'bg-emerald-500/20 text-emerald-400',
    WEEK_OFF: 'bg-purple-500/20 text-purple-400',
  }
  return map[status] || 'bg-white/10 text-white/50'
}

function isEditable(req) {
  if (req.status !== 'PENDING') return false
  try { return new Date(req.start_date) > new Date() } catch { return false }
}

function isCancellable(req) {
  if (req.status !== 'PENDING') return false
  try { return new Date(req.start_date) > new Date() } catch { return false }
}

function openRequestForm() {
  leaveStore.resetForm()
  leaveStore.showForm = true
}

function openEditForm(req) {
  leaveStore.request_id = req.id
  leaveStore.form = {
    leave_type_id: req.leave_type_id,
    start_date: req.start_date?.slice(0, 10) || '',
    end_date: req.end_date?.slice(0, 10) || '',
    is_half_day: req.is_half_day || false,
    half_day_type: req.half_day_type || 'FIRST_HALF',
    start_half_day: req.start_half_day || null,
    end_half_day: req.end_half_day || null,
    reason: req.reason || '',
    notify_employee_ids: [],
  }
  leaveStore.showForm = true
}

function confirmCancel(req) {
  cancelTargetId.value = req.id
  cancelReason.value = ''
  showCancelConfirm.value = true
}

async function doCancel() {
  await leaveStore.cancel(cancelTargetId.value, cancelReason.value)
  showCancelConfirm.value = false
  cancelTargetId.value = null
}

async function submitRequest() {
  if (leaveStore.request_id) {
    await leaveStore.edit(leaveStore.request_id, leaveStore.form)
  } else {
    await leaveStore.apply()
  }
}

async function load() {
  await Promise.all([
    leaveStore.fetchMyRequests(),
    leaveStore.fetchBalances(),
    leaveTypeStore.fetchLeaveTypes(),
  ])
}

onMounted(() => {
  load()
  loadCalendar()
})
</script>
