<template>
    <div class="flex h-full">
        <!-- LEFT: Form -->
        <div class="flex-1 overflow-y-auto pr-0 lg:pr-4">
            <!-- Title -->
            <div class="mb-6">
                <h2 class="text-lg font-semibold text-white/90">{{ isEdit ? 'Edit Weekly Off' : 'Add Weekly Off' }}</h2>
                <p class="text-xs text-white/50 mt-1">{{ isEdit ? 'Update the weekly off details here' : 'You can create a new weekly off here' }}</p>
            </div>

            <!-- Section: Basic Information -->
            <div class="mb-6">
                <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Basic Information</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-white/70 mb-1.5">Weekly Off Name *</label>
                        <input v-model="form.name" type="text" placeholder="Ex: Saturdays and Sundays" class="input-field" />
                        <p v-if="errors.name" class="text-xs text-rose-400 mt-1">{{ errors.name }}</p>
                    </div>
                    <div>
                        <div v-if="!showDescription">
                            <button @click="showDescription = true" class="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                + Add description
                            </button>
                        </div>
                        <div v-else>
                            <label class="block text-xs font-semibold text-white/70 mb-1.5">Description</label>
                            <textarea v-model="form.description" placeholder="Optional description" rows="3"
                                class="input-field resize-none"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border-t border-white/10 mb-6"></div>

            <!-- Section: Days Off -->
            <div class="mb-6">
                <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1">Days Off</h3>
                <p class="text-xs text-white/40 mb-3">Select the days that are weekly offs.</p>
                <div class="flex gap-2 flex-wrap mb-3">
                    <button v-for="day in allDays" :key="day.key" @click="toggleDay(day.key)"
                        class="w-11 h-11 rounded-lg text-xs font-semibold transition-all"
                        :class="form.selectedDays.includes(day.key)
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 shadow-sm shadow-emerald-400/10'
                            : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'">
                        {{ day.abbr }}
                    </button>
                </div>
                <p v-if="errors.days" class="text-xs text-rose-400 mt-1">{{ errors.days }}</p>

                <!-- Customize Toggle -->
                <button v-if="form.selectedDays.length > 0" @click="customizeOpen = !customizeOpen"
                    class="text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-1">
                    {{ customizeOpen ? 'Hide customization' : 'Customize' }}
                </button>
            </div>

            <!-- Customize Days Off -->
            <template v-if="customizeOpen && form.selectedDays.length > 0">
                <div class="border-t border-white/10 mb-6"></div>
                <div class="mb-6">
                    <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Customize Days Off</h3>
                    <div class="space-y-4">
                        <div v-for="day in form.selectedDays" :key="day"
                            class="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="text-sm font-medium text-white/90">{{ day }}</h4>
                                <button @click="addConfigRow(day)"
                                    class="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors">
                                    + Add row
                                </button>
                            </div>
                            <div class="space-y-3">
                                <div v-for="(config, rowIdx) in getDayConfigs(day)" :key="rowIdx"
                                    class="rounded-lg bg-white/5 border border-white/10 p-3">
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <!-- Occurrence Multi-Select -->
                                        <div>
                                            <label class="block text-[11px] text-white/50 mb-1">Occurrence</label>
                                            <div class="relative" ref="occurrenceRefs">
                                                <button @click.stop="toggleOccurrenceDropdown(day, rowIdx)"
                                                    class="w-full input-field text-left flex items-center justify-between text-xs">
                                                    <span class="truncate">
                                                        {{ getOccurrenceLabel(config.occurrences, day) }}
                                                    </span>
                                                    <Icon name="ion:chevron-down" class="w-3.5 h-3.5 shrink-0 ml-1 text-white/40" />
                                                </button>
                                                <div v-if="openOccurrence === `${day}-${rowIdx}`"
                                                    data-occurrence-dropdown
                                                    class="absolute left-0 top-full mt-1 w-full rounded-lg bg-[#1a1d27] border border-white/15 shadow-xl z-50 py-1 max-h-48 overflow-y-auto">
                                                    <div v-for="opt in getOccurrenceOptions(day)" :key="opt.value"
                                                        @click="toggleOccurrence(day, rowIdx, opt.value)"
                                                        class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 cursor-pointer transition-colors select-none">
                                                        <div class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                                                            :class="config.occurrences.includes(opt.value)
                                                                ? 'bg-emerald-500 border-emerald-500'
                                                                : 'bg-white/10 border-white/20'">
                                                            <svg v-if="config.occurrences.includes(opt.value)" class="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                                                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                            </svg>
                                                        </div>
                                                        <span class="text-xs text-white/80">{{ opt.label }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Weekly Off Type -->
                                        <div>
                                            <label class="block text-[11px] text-white/50 mb-1">Weekly Off Type</label>
                                            <select v-model="config.type" class="input-field text-xs">
                                                <option value="FULL_DAY" class="bg-[#1a1d27]">Full Day Weekly Off</option>
                                                <option value="FIRST_HALF" class="bg-[#1a1d27]">First Half Weekly Off</option>
                                                <option value="SECOND_HALF" class="bg-[#1a1d27]">Second Half Weekly Off</option>
                                            </select>
                                        </div>
                                    </div>
                                    <!-- Remove Row -->
                                    <div v-if="getDayConfigs(day).length > 1" class="mt-2 flex justify-end">
                                        <button @click="removeConfigRow(day, rowIdx)"
                                            class="text-[11px] text-rose-400 hover:text-rose-300 transition-colors">
                                            Remove
                                        </button>
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
                <div>
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">What is a Weekly Off?</h4>
                    <p class="text-[11px] text-white/50 leading-relaxed">A weekly off is a recurring day or half-day when employees do not work.</p>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">Occurrence</h4>
                    <p class="text-[11px] text-white/50 leading-relaxed">Control which specific weeks the weekly off applies to. For example, only 1st and 3rd Saturdays.</p>
                </div>
                <div>
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">Full Day vs Half Day</h4>
                    <p class="text-[11px] text-white/50 leading-relaxed">Full Day covers the entire shift. First Half or Second Half applies only to that portion of the day.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    weeklyOff: { type: Object, default: null },
    saving: { type: Boolean, default: false },
})

const emit = defineEmits(['save', 'cancel'])

const isEdit = ref(!!props.weeklyOff)
const showDescription = ref(false)
const customizeOpen = ref(false)
const openOccurrence = ref(null)

const allDays = [
    { key: 'Monday', abbr: 'M' },
    { key: 'Tuesday', abbr: 'T' },
    { key: 'Wednesday', abbr: 'W' },
    { key: 'Thursday', abbr: 'T' },
    { key: 'Friday', abbr: 'F' },
    { key: 'Saturday', abbr: 'S' },
    { key: 'Sunday', abbr: 'S' },
]

const offTypes = [
    { value: 'FULL_DAY', label: 'Full Day Weekly Off' },
    { value: 'FIRST_HALF', label: 'First Half Weekly Off' },
    { value: 'SECOND_HALF', label: 'Second Half Weekly Off' },
]

const defaultConfig = () => ({
    occurrences: ['ALL'],
    type: 'FULL_DAY',
})

const defaultForm = () => ({
    name: '',
    description: '',
    selectedDays: [],
    dayConfigs: {},
})

const form = ref(defaultForm())
const errors = ref({})

onMounted(() => {
    if (props.weeklyOff) loadWeeklyOffData(props.weeklyOff)
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

watch(() => props.weeklyOff, (newVal) => {
    if (newVal) {
        loadWeeklyOffData(newVal)
        isEdit.value = true
    } else {
        resetForm()
        isEdit.value = false
    }
})

const loadWeeklyOffData = (data) => {
    showDescription.value = !!data.description
    const configs = {}
    if (data.dayConfigs) {
        Object.keys(data.dayConfigs).forEach(day => {
            configs[day] = data.dayConfigs[day].map(c => ({
                occurrences: [...c.occurrences],
                type: c.type,
            }))
        })
    } else if (data.days) {
        data.days.forEach(day => {
            configs[day] = [defaultConfig()]
        })
    }
    form.value = {
        name: data.name || '',
        description: data.description || '',
        selectedDays: data.days ? [...data.days] : [],
        dayConfigs: configs,
    }
}

const resetForm = () => {
    showDescription.value = false
    customizeOpen.value = false
    form.value = defaultForm()
    errors.value = {}
}

const getDayConfigs = (day) => {
    return form.value.dayConfigs[day] || []
}

const toggleDay = (dayKey) => {
    const idx = form.value.selectedDays.indexOf(dayKey)
    if (idx >= 0) {
        form.value.selectedDays.splice(idx, 1)
        delete form.value.dayConfigs[dayKey]
    } else {
        form.value.selectedDays.push(dayKey)
        form.value.dayConfigs[dayKey] = [defaultConfig()]
    }
}

const addConfigRow = (day) => {
    if (!form.value.dayConfigs[day]) {
        form.value.dayConfigs[day] = []
    }
    form.value.dayConfigs[day].push(defaultConfig())
}

const removeConfigRow = (day, rowIdx) => {
    if (form.value.dayConfigs[day] && form.value.dayConfigs[day].length > 1) {
        form.value.dayConfigs[day].splice(rowIdx, 1)
    }
}

const getOccurrenceOptions = (day) => {
    const numPrefix = { Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday', Thursday: 'Thursday', Friday: 'Friday', Saturday: 'Saturday', Sunday: 'Sunday' }
    const dayName = numPrefix[day]
    const options = [{ value: 'ALL', label: `All ${dayName}s` }]
    for (let i = 1; i <= 5; i++) {
        const suffix = i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'
        options.push({ value: `${i}`, label: `${i}${suffix} ${dayName}` })
    }
    options.push({ value: 'LAST', label: `Last ${dayName}` })
    return options
}

const getOccurrenceLabel = (occurrences, day) => {
    if (!occurrences || occurrences.length === 0) return 'Select occurrence'
    if (occurrences.includes('ALL')) return `All ${day}s`
    const dayName = day
    const labels = occurrences.map(o => {
        if (o === 'LAST') return `Last ${dayName}`
        const suffix = o === '1' ? 'st' : o === '2' ? 'nd' : o === '3' ? 'rd' : 'th'
        return `${o}${suffix} ${dayName}`
    })
    return labels.join(', ')
}

const toggleOccurrenceDropdown = (day, rowIdx) => {
    const key = `${day}-${rowIdx}`
    openOccurrence.value = openOccurrence.value === key ? null : key
}

const toggleOccurrence = (day, rowIdx, value) => {
    const config = form.value.dayConfigs[day][rowIdx]
    const allKey = 'ALL'
    const idx = config.occurrences.indexOf(value)

    if (value === allKey) {
        config.occurrences = [allKey]
    } else {
        const allIdx = config.occurrences.indexOf(allKey)
        if (allIdx >= 0) {
            config.occurrences.splice(allIdx, 1)
        }
        if (idx >= 0) {
            config.occurrences.splice(idx, 1)
        } else {
            config.occurrences.push(value)
        }
    }

    if (config.occurrences.length === 0) {
        config.occurrences = [allKey]
    }
}

const usedOccurrences = (day, currentRowIdx) => {
    const configs = form.value.dayConfigs[day] || []
    const used = []
    configs.forEach((c, i) => {
        if (i !== currentRowIdx) {
            used.push(...c.occurrences)
        }
    })
    return used
}

const handleClickOutside = (e) => {
    if (!e.target.closest('[data-occurrence-dropdown]')) {
        openOccurrence.value = null
    }
}

const validate = () => {
    errors.value = {}
    if (!form.value.name?.trim()) errors.value.name = 'Weekly off name is required'
    if (form.value.selectedDays.length === 0) {
        errors.value.days = 'Select at least one day'
    } else {
        // Per-day: no duplicate occurrences across rows; ALL cannot combine with others
        for (const day of form.value.selectedDays) {
            const rows = form.value.dayConfigs[day] || []
            const allOccs = []
            rows.forEach(r => allOccs.push(...(r.occurrences || [])))
            if (allOccs.includes('ALL') && allOccs.length > 1) {
                errors.value.days = `${day}: ALL cannot be combined with individual occurrences`
                break
            }
            const unique = new Set(allOccs)
            if (unique.size !== allOccs.length) {
                errors.value.days = `${day}: duplicate occurrence selected`
                break
            }
        }
    }
    return Object.keys(errors.value).length === 0
}

const buildData = () => {
    const data = {
        id: props.weeklyOff?.id || String(Date.now()),
        name: form.value.name.trim(),
        description: form.value.description?.trim() || '',
        days: [...form.value.selectedDays],
        dayConfigs: {},
    }
    form.value.selectedDays.forEach(day => {
        data.dayConfigs[day] = (form.value.dayConfigs[day] || []).map(c => ({
            occurrences: [...c.occurrences],
            type: c.type,
        }))
    })
    return data
}

const handleSave = () => {
    if (!validate()) return
    emit('save', buildData())
}

defineExpose({ validate, buildData, handleSave })
</script>

<style scoped>
.input-field {
    @apply w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white
           placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/60
           transition-colors;
}
</style>
