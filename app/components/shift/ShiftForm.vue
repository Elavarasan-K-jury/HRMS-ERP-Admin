<template>
    <div class="flex h-full">
        <!-- LEFT: Form -->
        <div class="flex-1 overflow-y-auto pr-0 lg:pr-4">
            <!-- Title -->
            <div class="mb-6">
                <h2 class="text-lg font-semibold text-white/90">{{ isEdit ? 'Edit Shift' : 'Add Shift' }}</h2>
                <p class="text-xs text-white/50 mt-1">{{ isEdit ? 'Update the shift details here' : 'You can create a new shift here' }}</p>
            </div>

            <!-- Section: Basic Information -->
            <div class="mb-6">
                <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Basic Information</h3>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-white/70 mb-1.5">Shift Name *</label>
                            <input v-model="form.name" type="text" placeholder="Ex: General Shift" class="input-field" />
                            <p v-if="errors.name" class="text-xs text-rose-400 mt-1">{{ errors.name }}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-white/70 mb-1.5">Shift Code *</label>
                            <input v-model="form.code" type="text" placeholder="Ex: GS" class="input-field" />
                            <p v-if="errors.code" class="text-xs text-rose-400 mt-1">{{ errors.code }}</p>
                        </div>
                    </div>
                    <div>
                        <div v-if="!showDescription">
                            <button @click="showDescription = true" class="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                + Add description
                            </button>
                        </div>
                        <div v-else>
                            <label class="block text-xs font-semibold text-white/70 mb-1.5">Description</label>
                            <textarea v-model="form.description" placeholder="Optional shift description" rows="3"
                                class="input-field resize-none"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border-t border-white/10 mb-6"></div>

            <!-- Section: Shift Type -->
            <div class="mb-6">
                <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Shift Type</h3>
                <div class="flex gap-6">
                    <label class="flex items-center gap-2.5 cursor-pointer group">
                        <input type="radio" v-model="form.shiftType" value="fixed"
                            class="w-4 h-4 text-emerald-400 bg-white/10 border-white/20 focus:ring-emerald-400/50" />
                        <span class="text-sm text-white/80 group-hover:text-white transition-colors">Fixed shift timings</span>
                    </label>
                    <label class="flex items-center gap-2.5 cursor-pointer group">
                        <input type="radio" v-model="form.shiftType" value="flexible"
                            class="w-4 h-4 text-emerald-400 bg-white/10 border-white/20 focus:ring-emerald-400/50" />
                        <span class="text-sm text-white/80 group-hover:text-white transition-colors">Flexible work hours</span>
                    </label>
                </div>
            </div>

            <!-- Fixed Shift Configuration -->
            <template v-if="form.shiftType === 'fixed'">
                <div class="border-t border-white/10 mb-6"></div>

                <!-- Section: Working Days -->
                <div class="mb-6">
                    <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">Working Days</h3>
                    <p class="text-xs text-white/40 mb-3">Select the days on which this shift applies.</p>
                    <div class="flex gap-2 flex-wrap">
                        <button v-for="day in allDays" :key="day.key" @click="toggleWorkingDay(day.key)"
                            class="w-11 h-11 rounded-lg text-xs font-semibold transition-all"
                            :class="form.workingDays.includes(day.key)
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 shadow-sm shadow-emerald-400/10'
                                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'">
                            {{ day.abbr }}
                        </button>
                    </div>
                    <p v-if="errors.workingDays" class="text-xs text-rose-400 mt-1.5">{{ errors.workingDays }}</p>
                </div>

                <div class="border-t border-white/10 mb-6"></div>

                <!-- Section: Shift Timings -->
                <div class="mb-6">
                    <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">Shift Timings</h3>
                    <p class="text-xs text-white/40 mb-3">Configure the working hours for this shift.</p>

                    <!-- Start / End Time — Two Columns -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-xs font-semibold text-white/70 mb-1.5">Start Time</label>
                            <div class="relative">
                                <input :value="formatTime12(form.startTime)" @input="parseTime12($event.target.value, 'start')"
                                    type="text" placeholder="09:00 AM" maxlength="8"
                                    class="input-field pr-9" />
                                <Icon name="ion:time-outline" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                            </div>
                            <p v-if="errors.startTime" class="text-xs text-rose-400 mt-1">{{ errors.startTime }}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-white/70 mb-1.5">End Time</label>
                            <div class="relative">
                                <input :value="formatTime12(form.endTime)" @input="parseTime12($event.target.value, 'end')"
                                    type="text" placeholder="06:00 PM" maxlength="8"
                                    class="input-field pr-9" />
                                <Icon name="ion:time-outline" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                            </div>
                            <p v-if="errors.endTime" class="text-xs text-rose-400 mt-1">{{ errors.endTime }}</p>
                        </div>
                                            <div>
                        <label class="block text-xs font-semibold text-white/70 mb-1.5">Break Duration</label>
                        <div class="flex items-center gap-2">
                            <input v-model.number="form.breakMinutes" type="number" min="0" class="w-20 input-field" />
                            <span class="text-xs text-white/50">minutes</span>
                        </div>
                        <p v-if="errors.breakMinutes" class="text-xs text-rose-400 mt-1">{{ errors.breakMinutes }}</p>
                    </div>
                    </div>

                    <!-- Break Duration -->

                </div>

                <div class="border-t border-white/10 mb-6"></div>

                <!-- Section: Gross Hours -->
                <div class="mb-6">
                    <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Gross Hours</h3>
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" v-model="form.requireGrossHours"
                            class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                        <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employees are expected to complete defined Gross hours once they come in</span>
                    </label>
                    <div v-if="form.requireGrossHours" class="mt-3 ml-7">
                        <label class="block text-xs font-semibold text-white/70 mb-1.5">Gross Hours</label>
                        <div class="flex items-center gap-2">
                            <input v-model.number="form.grossHours" type="number" min="1" max="24" class="w-20 input-field" />
                            <span class="text-xs text-white/50">hours</span>
                        </div>
                        <p v-if="errors.grossHours" class="text-xs text-rose-400 mt-1">{{ errors.grossHours }}</p>
                    </div>

                    <!-- Effective Hours (read-only calculated) -->
                    <div v-if="form.requireGrossHours" class="mt-4 ml-7 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5">
                        <label class="block text-xs font-semibold text-emerald-300/90 mb-1">Effective Hours (calculated)</label>
                        <div class="flex items-baseline gap-2">
                            <span class="text-lg font-semibold text-emerald-300">{{ formatEffectiveHours(effectiveHours) }}</span>
                            <span class="text-[11px] text-white/40">Gross − Break</span>
                        </div>
                        <p v-if="errors.effectiveHours" class="text-xs text-rose-400 mt-1">{{ errors.effectiveHours }}</p>
                    </div>
                </div>
            </template>

            <!-- Flexible Shift Configuration -->
            <template v-if="form.shiftType === 'flexible'">
                <div class="border-t border-white/10 mb-6"></div>

                <!-- Section: Working Days -->
                <div class="mb-6">
                    <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">Working Days</h3>
                    <p class="text-xs text-white/40 mb-3">Select the days on which this shift applies.</p>
                    <div class="flex gap-2 flex-wrap">
                        <button v-for="day in allDays" :key="day.key" @click="toggleWorkingDay(day.key)"
                            class="w-11 h-11 rounded-lg text-xs font-semibold transition-all"
                            :class="form.workingDays.includes(day.key)
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 shadow-sm shadow-emerald-400/10'
                                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'">
                            {{ day.abbr }}
                        </button>
                    </div>
                    <p v-if="errors.workingDays" class="text-xs text-rose-400 mt-1.5">{{ errors.workingDays }}</p>
                </div>

                <div class="border-t border-white/10 mb-6"></div>

                <!-- Section: Break Duration -->
                <div class="mb-6">
                    <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Break Duration</h3>
                    <div class="flex items-center gap-2">
                        <input v-model.number="form.breakMinutes" type="number" min="0" class="w-20 input-field" />
                        <span class="text-xs text-white/50">minutes</span>
                    </div>
                    <p v-if="errors.breakMinutes" class="text-xs text-rose-400 mt-1">{{ errors.breakMinutes }}</p>
                </div>

                <div class="border-t border-white/10 mb-6"></div>

                <!-- Section: Gross Hours -->
                <div class="mb-6">
                    <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Gross Hours</h3>
                    <label class="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" v-model="form.requireGrossHours"
                            class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400/50" />
                        <span class="text-sm text-white/80 group-hover:text-white transition-colors">Employees are expected to complete defined Gross hours once they come in</span>
                    </label>
                    <div v-if="form.requireGrossHours" class="mt-3 ml-7">
                        <label class="block text-xs font-semibold text-white/70 mb-1.5">Gross Hours</label>
                        <div class="flex items-center gap-2">
                            <input v-model.number="form.grossHours" type="number" min="1" max="24" class="w-20 input-field" />
                            <span class="text-xs text-white/50">hours</span>
                        </div>
                        <p v-if="errors.grossHours" class="text-xs text-rose-400 mt-1">{{ errors.grossHours }}</p>
                    </div>
                    <p v-else class="text-xs text-rose-400 mt-2">Gross hours are required for flexible shifts.</p>

                    <!-- Effective Hours (read-only calculated) — never from 00:00–23:59 placeholder -->
                    <div v-if="form.requireGrossHours" class="mt-4 ml-7 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5">
                        <label class="block text-xs font-semibold text-emerald-300/90 mb-1">Effective Hours (calculated)</label>
                        <div class="flex items-baseline gap-2">
                            <span class="text-lg font-semibold text-emerald-300">{{ formatEffectiveHours(effectiveHours) }}</span>
                            <span class="text-[11px] text-white/40">Gross − Break</span>
                        </div>
                        <p v-if="errors.effectiveHours" class="text-xs text-rose-400 mt-1">{{ errors.effectiveHours }}</p>
                    </div>
                </div>

                <div class="border-t border-white/10 mb-6"></div>

                <!-- Section: Advanced Options -->
                <div class="mb-6">
                    <button @click="showAdvanced = !showAdvanced"
                        class="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors mb-3">
                        <Icon :name="showAdvanced ? 'ion:chevron-down' : 'ion:chevron-right'" class="w-4 h-4" />
                        Advanced options
                    </button>
                    <div v-if="showAdvanced" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-white/70 mb-1.5">Maximum shift duration possible is</label>
                            <div class="flex items-center gap-2">
                                <input v-model.number="form.maxDuration" type="number" min="1" max="24" class="w-20 input-field" />
                                <span class="text-xs text-white/50">hours</span>
                            </div>
                            <p class="text-[11px] text-white/40 mt-1">after the employee's first punch in for the day.</p>
                            <p v-if="errors.maxDuration" class="text-xs text-rose-400 mt-1">{{ errors.maxDuration }}</p>
                        </div>

                        <!-- Explanation Visual -->
                        <div class="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div class="flex items-center gap-2 mb-3">
                                <Icon name="ion:information-circle-outline" class="w-4 h-4 text-emerald-400" />
                                <span class="text-[11px] font-semibold text-white/50 uppercase tracking-wide">How it works</span>
                            </div>
                            <div class="space-y-3">
                                <div class="flex items-start gap-3">
                                    <div class="w-16 shrink-0 text-[11px] font-semibold text-emerald-400 uppercase">Day 1</div>
                                    <div class="flex-1">
                                        <div class="text-xs text-white/50">First Clock-In</div>
                                        <div class="text-xs text-white/90 font-medium">Day 1 - 09:30 PM</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div class="w-16 shrink-0"></div>
                                    <div class="flex items-center gap-2">
                                        <div class="w-px h-6 bg-emerald-400/30"></div>
                                        <span class="text-[11px] text-emerald-400 font-medium">{{ form.maxDuration || 16 }} hrs</span>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <div class="w-16 shrink-0"></div>
                                    <div class="flex-1">
                                        <div class="text-xs text-white/50">Last Possible Clock-Out</div>
                                        <div class="text-xs text-white/90 font-medium">Day 2 - 01:30 PM</div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div class="w-16 shrink-0"></div>
                                    <div class="flex items-center gap-2">
                                        <div class="w-px h-6 bg-white/20"></div>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <div class="w-16 shrink-0 text-[11px] font-semibold text-emerald-400 uppercase">Day 2</div>
                                    <div class="flex-1">
                                        <div class="text-xs text-white/50">First Possible Clock-In</div>
                                        <div class="text-xs text-white/70">Any log after 01:30 PM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- RIGHT: Help Panel -->
        <div class="hidden lg:block w-64 shrink-0 border-l border-white/10 pl-4">
            <div class="space-y-5">
                <div v-if="form.shiftType === 'fixed'">
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">What are fixed work hours?</h4>
                    <p class="text-[11px] text-white/50 leading-relaxed">Employees are expected to work according to the configured shift timings.</p>
                </div>
                <div v-if="form.shiftType === 'flexible'">
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">What are flexible work hours?</h4>
                    <p class="text-[11px] text-white/50 leading-relaxed">Flexible work hours do not have a fixed schedule. Employees can work within the configured requirements.</p>
                </div>
                <div v-if="form.shiftType === 'fixed'">
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">Working Days</h4>
                    <p class="text-[11px] text-white/50 leading-relaxed">Select all days on which this shift schedule applies.</p>
                </div>
                <div v-if="form.shiftType === 'flexible'">
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">Working Days</h4>
                    <p class="text-[11px] text-white/50 leading-relaxed">Select all days on which this flexible shift schedule applies.</p>
                </div>
                <div v-if="form.shiftType === 'fixed'">
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">Gross Hours</h4>
                    <p class="text-[11px] text-white/50 leading-relaxed">An optional requirement for employees to complete a minimum number of work hours per shift.</p>
                </div>
                <div v-if="form.shiftType === 'flexible'">
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">Maximum Duration</h4>
                    <p class="text-[11px] text-white/50 leading-relaxed">The maximum time window from first clock-in during which the employee can complete their work.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'

const props = defineProps({
    shift: { type: Object, default: null },
    saving: { type: Boolean, default: false },
})

const emit = defineEmits(['save', 'cancel'])

const isEdit = ref(!!props.shift)
const showDescription = ref(false)
const showAdvanced = ref(true)

const allDays = [
    { key: 'Monday', abbr: 'M' },
    { key: 'Tuesday', abbr: 'T' },
    { key: 'Wednesday', abbr: 'W' },
    { key: 'Thursday', abbr: 'T' },
    { key: 'Friday', abbr: 'F' },
    { key: 'Saturday', abbr: 'S' },
    { key: 'Sunday', abbr: 'S' },
]

const defaultForm = () => ({
    name: '',
    code: '',
    description: '',
    shiftType: 'fixed',
    workingDays: [],
    startTime: '09:00',
    startPeriod: 'AM',
    endTime: '18:00',
    endPeriod: 'PM',
    breakMinutes: 60,
    requireGrossHours: false,
    grossHours: 9,
    maxDuration: 16,
})

const form = ref(defaultForm())
const errors = ref({})

/**
 * Effective Hours = Gross Hours − (Break Minutes / 60).
 * Never derived from start/end times or Flexible 00:00–23:59 placeholder.
 * null when gross hours are not configured.
 */
const effectiveHours = computed(() => {
    if (!form.value.requireGrossHours) return null
    const gross = Number(form.value.grossHours)
    if (!Number.isFinite(gross) || gross <= 0) return null
    const breakMin = Number(form.value.breakMinutes) || 0
    if (breakMin < 0) return null
    return Math.round((gross - breakMin / 60) * 100) / 100
})

/** Display without float noise: 8 → "8 hrs", 8.5 → "8 hrs 30 mins", 7.25 → "7 hrs 15 mins" */
const formatEffectiveHours = (h) => {
    if (h === null || h === undefined || !Number.isFinite(Number(h))) return '—'
    const totalMins = Math.round(Number(h) * 60)
    const hrs = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    if (hrs === 0 && mins === 0) return '0 hrs'
    if (mins === 0) return `${hrs} hr${hrs === 1 ? '' : 's'}`
    if (hrs === 0) return `${mins} min${mins === 1 ? '' : 's'}`
    return `${hrs} hr${hrs === 1 ? '' : 's'} ${mins} min${mins === 1 ? '' : 's'}`
}

onMounted(() => {
    if (props.shift) loadShiftData(props.shift)
})

watch(() => props.shift, (newVal) => {
    if (newVal) {
        loadShiftData(newVal)
        isEdit.value = true
    } else {
        resetForm()
        isEdit.value = false
    }
})

const deriveCode = (name) => {
    if (!name) return ''
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return ''
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase()
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 4)
}

const loadShiftData = (shift) => {
    showDescription.value = !!shift.description
    form.value = {
        name: shift.name || '',
        code: shift.code || deriveCode(shift.name) || '',
        description: shift.description || '',
        shiftType: shift.shiftType || 'fixed',
        workingDays: shift.workingDays ? [...shift.workingDays] : [],
        startTime: shift.startTime || '09:00',
        startPeriod: shift.startPeriod || 'AM',
        endTime: shift.endTime || '18:00',
        endPeriod: shift.endPeriod || 'PM',
        breakMinutes: shift.breakMinutes ?? 60,
        requireGrossHours: shift.requireGrossHours || shift.fixedGrossEnabled || !!shift.grossHours,
        grossHours: shift.grossHours || shift.fixedGrossHours || 9,
        maxDuration: shift.maxDuration || 16,
    }
}

const resetForm = () => {
    showDescription.value = false
    form.value = defaultForm()
    errors.value = {}
}

const toggleWorkingDay = (dayKey) => {
    const idx = form.value.workingDays.indexOf(dayKey)
    if (idx >= 0) {
        form.value.workingDays.splice(idx, 1)
    } else {
        form.value.workingDays.push(dayKey)
    }
}

const to12Hour = (time24) => {
    const [hs, ms] = String(time24 || '').split(':')
    const h = parseInt(hs, 10)
    const m = parseInt(ms, 10)
    if (isNaN(h)) return { hour: 9, minute: 0, period: 'AM' }
    const minute = isNaN(m) ? 0 : m
    if (h === 0) return { hour: 12, minute, period: 'AM' }
    if (h < 12) return { hour: h, minute, period: 'AM' }
    if (h === 12) return { hour: 12, minute, period: 'PM' }
    return { hour: h - 12, minute, period: 'PM' }
}

const to24Hour = (h12, period, m12) => {
    let h = parseInt(h12, 10)
    let m = parseInt(m12, 10)
    if (isNaN(h) || h < 1 || h > 12) return '09:00'
    if (isNaN(m) || m < 0) m = 0
    if (m > 59) m = 59
    if (period === 'AM') {
        h = h === 12 ? 0 : h
    } else {
        h = h === 12 ? 12 : h + 12
    }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const formatTime12 = (time24) => {
    if (!time24) return ''
    const { hour, minute, period } = to12Hour(time24)
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
}

const parseTime12 = (val, field) => {
    const cleaned = val.replace(/[^0-9AMPamp:]/g, '').toUpperCase()
    const match = cleaned.match(/^(\d{1,2}):?(\d{0,2})\s*(AM|PM)?$/)
    if (!match) return
    const h = parseInt(match[1], 10)
    if (isNaN(h) || h < 1 || h > 12) return
    const existing = field === 'start' ? form.value.startTime : form.value.endTime
    const existingMin = String(existing || '').split(':')[1] || '00'
    let m
    if (match[2] === '') {
        m = parseInt(existingMin, 10)
    } else if (match[2].length === 1) {
        m = parseInt(match[2] + '0', 10)
    } else {
        m = parseInt(match[2], 10)
    }
    if (isNaN(m) || m < 0 || m > 59) return
    const fallbackPeriod = field === 'start' ? form.value.startPeriod : form.value.endPeriod
    const period = match[3] || fallbackPeriod || (h >= 12 ? 'PM' : 'AM')
    const h24 = to24Hour(h, period, m)
    if (field === 'start') {
        form.value.startTime = h24
        form.value.startPeriod = period
    } else {
        form.value.endTime = h24
        form.value.endPeriod = period
    }
}

const validate = () => {
    errors.value = {}

    if (!form.value.name?.trim()) errors.value.name = 'Shift name is required'
    if (!form.value.code?.trim()) errors.value.code = 'Shift code is required'

    if (form.value.workingDays.length === 0) {
        errors.value.workingDays = 'Select at least one working day'
    }

    if (form.value.breakMinutes < 0) {
        errors.value.breakMinutes = 'Break duration must be 0 or more'
    }

    if (form.value.shiftType === 'fixed') {
        if (!form.value.startTime) errors.value.startTime = 'Start time is required'
        if (!form.value.endTime) errors.value.endTime = 'End time is required'
        if (form.value.requireGrossHours && (!form.value.grossHours || form.value.grossHours <= 0)) {
            errors.value.grossHours = 'Gross hours must be greater than 0'
        }
    }

    if (form.value.shiftType === 'flexible') {
        if (!form.value.requireGrossHours || !form.value.grossHours || form.value.grossHours <= 0) {
            errors.value.grossHours = 'Gross hours are required for flexible shifts'
        }
        if (!form.value.maxDuration || form.value.maxDuration <= 0) {
            errors.value.maxDuration = 'Maximum duration must be greater than 0'
        }
    }

    // Effective hours must never go negative: break_minutes <= gross_hours * 60
    if (form.value.requireGrossHours && form.value.grossHours > 0 && form.value.breakMinutes >= 0) {
        const breakMin = Number(form.value.breakMinutes) || 0
        if (breakMin > form.value.grossHours * 60) {
            errors.value.breakMinutes = 'Break duration cannot exceed gross hours (effective hours would be negative)'
            errors.value.effectiveHours = 'Effective hours cannot be negative'
        }
    }

    return Object.keys(errors.value).length === 0
}

const buildShiftData = () => {
    const data = {
        id: props.shift?.id || String(Date.now()),
        name: form.value.name.trim(),
        code: form.value.code.trim(),
        description: form.value.description?.trim() || '',
        shiftType: form.value.shiftType,
        employees: props.shift?.employees || 0,
        workingDays: [...form.value.workingDays],
        requireGrossHours: form.value.requireGrossHours,
        grossHours: form.value.requireGrossHours ? form.value.grossHours : null,
        // Break applies to both Fixed and Flexible (Phase 25 Gross/Break/Effective model)
        breakMinutes: form.value.breakMinutes ?? 0,
        effectiveHours: effectiveHours.value,
    }

    if (form.value.shiftType === 'fixed') {
        data.startTime = form.value.startTime
        data.startPeriod = form.value.startPeriod
        data.endTime = form.value.endTime
        data.endPeriod = form.value.endPeriod
        data.timings = `${formatTime12(form.value.startTime)} - ${formatTime12(form.value.endTime)}`
    } else {
        data.startTime = null
        data.startPeriod = null
        data.endTime = null
        data.endPeriod = null
        data.maxDuration = form.value.maxDuration
        data.timings = 'Flexible'
    }

    return data
}

const handleSave = () => {
    if (!validate()) return
    emit('save', buildShiftData())
}

defineExpose({ validate, buildShiftData, handleSave, effectiveHours, formatEffectiveHours })
</script>

<style scoped>
.input-field {
    @apply w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white
           placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60
           transition-colors;
}
</style>
