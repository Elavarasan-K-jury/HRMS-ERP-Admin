<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- HEADER -->
        <div class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="goBack" class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                    <Icon name="ion:arrow-back" class="w-5 h-5" />
                </button>
                <div>
                    <h2 class="text-lg font-semibold text-white/90">Import {{ importType === 'shift' ? 'Shift Assignments' : 'Weekly Off Assignments' }}</h2>
                    <p class="text-xs text-white/50">Bulk import via Excel/CSV</p>
                </div>
            </div>
        </div>

        <!-- STEP INDICATOR -->
        <div class="flex items-center justify-center gap-0 py-3">
            <div class="flex items-center gap-2 cursor-pointer" @click="goToStep(1)">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors"
                    :class="currentStep > 1 ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-400' : currentStep === 1 ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-400' : 'bg-white/5 border border-white/15 text-white/40'">
                    <Icon v-if="currentStep > 1" name="ion:checkmark" class="w-3.5 h-3.5" />
                    <span v-else>1</span>
                </span>
                <span class="text-xs font-medium" :class="currentStep >= 1 ? (currentStep > 1 ? 'text-emerald-400' : 'text-indigo-400') : 'text-white/40'">Upload</span>
            </div>
            <div class="w-8 h-px mx-2" :class="currentStep > 1 ? 'bg-emerald-400/50' : 'bg-white/15'"></div>
            <div class="flex items-center gap-2 cursor-pointer" @click="goToStep(2)">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors"
                    :class="currentStep > 2 ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-400' : currentStep === 2 ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-400' : 'bg-white/5 border border-white/15 text-white/40'">
                    <Icon v-if="currentStep > 2" name="ion:checkmark" class="w-3.5 h-3.5" />
                    <span v-else>2</span>
                </span>
                <span class="text-xs font-medium" :class="currentStep >= 2 ? (currentStep > 2 ? 'text-emerald-400' : 'text-indigo-400') : 'text-white/40'">Map Columns</span>
            </div>
            <div class="w-8 h-px mx-2" :class="currentStep > 2 ? 'bg-emerald-400/50' : 'bg-white/15'"></div>
            <div class="flex items-center gap-2 cursor-pointer" @click="goToStep(3)">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors"
                    :class="currentStep === 3 ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-400' : 'bg-white/5 border border-white/15 text-white/40'">
                    <span>3</span>
                </span>
                <span class="text-xs font-medium" :class="currentStep >= 3 ? 'text-indigo-400' : 'text-white/40'">Review &amp; Import</span>
            </div>
        </div>

        <!-- STEP 1: UPLOAD -->
        <div v-if="currentStep === 1" class="rounded-lg p-6 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex-1">
            <div class="max-w-2xl mx-auto">
                <h3 class="text-sm font-semibold text-white/90 mb-4">Upload your {{ importType === 'shift' ? 'Shift' : 'Weekly Off' }} file</h3>

                <div class="space-y-4 mb-6">
                    <div class="flex items-start gap-3">
                        <span class="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-xs font-semibold text-emerald-400 shrink-0 mt-0.5">1</span>
                        <div>
                            <p class="text-sm text-white/80">Download the template</p>
                            <p class="text-xs text-white/50 mt-0.5">Get the pre-formatted template with the correct column headers.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="w-6 h-6 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-xs font-medium text-white/40 shrink-0 mt-0.5">2</span>
                        <div>
                            <p class="text-sm text-white/80">Fill in the data</p>
                            <p class="text-xs text-white/50 mt-0.5">Add your {{ importType === 'shift' ? 'shift assignment' : 'weekly off assignment' }} data to the downloaded file.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="w-6 h-6 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-xs font-medium text-white/40 shrink-0 mt-0.5">3</span>
                        <div>
                            <p class="text-sm text-white/80">Upload the file</p>
                            <p class="text-xs text-white/50 mt-0.5">Select the completed file to begin the import process.</p>
                        </div>
                    </div>
                </div>

                <div class="rounded-lg bg-white/5 border border-white/10 p-4 mb-6">
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">Upload Instructions</h4>
                    <ul class="text-xs text-white/60 space-y-1.5">
                        <li class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span><strong class="text-white/80">Employee ID</strong> is required. Must be a valid employee ObjectId.</span>
                        </li>
                        <li v-if="importType === 'shift'" class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span><strong class="text-white/80">Shift ID</strong> is required. Must be a valid shift ObjectId.</span>
                        </li>
                        <li v-else class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span><strong class="text-white/80">Weekly Off Policy ID</strong> is required. Must be a valid policy ObjectId.</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span><strong class="text-white/80">Start Date / Effective From</strong> is required. Use <code class="bg-white/10 px-1 py-0.5 rounded">YYYY-MM-DD</code>.</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span><strong class="text-white/80">{{ importType === 'shift' ? 'End Date' : 'Effective To' }}</strong> is optional. Leave blank for permanent.</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span>Only the <strong class="text-white/80">first sheet</strong> in the workbook will be processed.</span>
                        </li>
                    </ul>
                </div>

                <div v-if="uploadError" class="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 mb-4">
                    <p class="text-sm text-rose-400">{{ uploadError }}</p>
                </div>

                <div class="flex items-center gap-3">
                    <UiButton color="#4aff7a" text="Download Template" prepend-icon="ion:download-outline" @click="downloadTemplate" />
                    <UiButton color="#fff" text="Upload File" prepend-icon="ion:cloud-upload-outline" @click="triggerUpload" :loading="uploading" />
                    <input ref="fileInput" type="file" accept=".csv,.xlsx" class="hidden" @change="handleFileUpload" />
                </div>
            </div>
        </div>

        <!-- STEP 2: MAP COLUMNS -->
        <div v-if="currentStep === 2" class="flex-1">
            <div class="mb-4">
                <h3 class="text-sm font-semibold text-white/90 mb-1">Columns Found</h3>
                <p class="text-xs text-white/50">Match your columns to the required fields.</p>
            </div>

            <div v-if="mappingErrors.length" class="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 mb-4">
                <ul class="text-sm text-rose-400 space-y-1">
                    <li v-for="(err, i) in mappingErrors" :key="i">{{ err }}</li>
                </ul>
            </div>

            <div class="rounded-lg border border-white/15 overflow-hidden mb-6">
                <table class="w-full text-sm text-white/90">
                    <thead class="bg-white/10 backdrop-blur-md border-b border-white/10">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-1/4">Column Name</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-1/3">Sample Value</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-1/3">Match To Field</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(col, idx) in excelColumns" :key="idx" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td class="px-4 py-3"><span class="font-medium text-white">{{ col.name }}</span></td>
                            <td class="px-4 py-3 text-white/60 text-xs">{{ col.sample }}</td>
                            <td class="px-4 py-3">
                                <select v-model="columnMappings[idx]" class="w-full max-w-xs rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50">
                                    <option value="ignore" class="bg-[#1a1d27]">Ignore</option>
                                    <option value="employeeId" class="bg-[#1a1d27]" :disabled="isMappedElsewhere('employeeId', idx)">Employee ID *</option>
                                    <option v-if="importType === 'shift'" value="shiftId" class="bg-[#1a1d27]" :disabled="isMappedElsewhere('shiftId', idx)">Shift ID *</option>
                                    <option v-else value="weeklyOffPolicyId" class="bg-[#1a1d27]" :disabled="isMappedElsewhere('weeklyOffPolicyId', idx)">Weekly Off Policy ID *</option>
                                    <option value="startDate" class="bg-[#1a1d27]" :disabled="isMappedElsewhere('startDate', idx)">{{ importType === 'shift' ? 'Start Date' : 'Effective From' }} *</option>
                                    <option value="endDate" class="bg-[#1a1d27]" :disabled="isMappedElsewhere('endDate', idx)">{{ importType === 'shift' ? 'End Date' : 'Effective To' }}</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex items-center gap-3">
                <UiButton color="#fff" text="Back" prepend-icon="ion:arrow-back" @click="goToStep(1)" />
                <UiButton color="#4aff7a" text="Continue" prepend-icon="ion:arrow-forward" @click="validateAndGoToReview" :disabled="!isMappingValid" />
            </div>
        </div>

        <!-- STEP 3: REVIEW -->
        <div v-if="currentStep === 3 && !importSuccess" class="rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex-1 flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                    <h3 class="text-sm font-semibold text-white/90">Review Imported Data</h3>
                    <p class="text-xs text-white/50 mt-0.5">
                        Total: {{ parsedRows.length }} rows &mdash;
                        <span class="text-emerald-400">{{ validCount }} valid</span> &mdash;
                        <span v-if="errorCount > 0" class="text-rose-400">{{ errorCount }} with errors</span>
                        <span v-else class="text-white/50">no errors</span>
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <UiButton color="#fff" text="Back" prepend-icon="ion:arrow-back" @click="goToStep(2)" size="sm" />
                    <UiButton color="#4aff7a" :text="'Import ' + (importType === 'shift' ? 'Shifts' : 'Weekly Offs')" prepend-icon="ion:cloud-upload"
                        :loading="submitting" :disabled="errorCount > 0 || submitting" size="sm" @click="submitImport" />
                </div>
            </div>

            <div v-if="backendError" class="mx-6 mt-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 shrink-0">
                <p class="text-sm text-rose-400">{{ backendError }}</p>
            </div>

            <div v-if="errorCount > 0 && !backendError" class="mx-6 mt-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 shrink-0">
                <p class="text-sm text-rose-400">Please fix all validation errors before continuing.</p>
            </div>

            <div class="flex-1 overflow-auto p-6">
                <div class="rounded-lg border border-white/15 overflow-hidden">
                    <table class="min-w-full text-sm text-white/90">
                        <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                            <tr>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-12">Row</th>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">Employee ID</th>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">{{ importType === 'shift' ? 'Shift ID' : 'Policy ID' }}</th>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">{{ importType === 'shift' ? 'Start Date' : 'Effective From' }}</th>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">{{ importType === 'shift' ? 'End Date' : 'Effective To' }}</th>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-20">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, idx) in parsedRows" :key="idx" class="border-b border-white/5 hover:bg-white/5 transition-colors" :class="row._errors?.length ? 'bg-rose-500/5' : ''">
                                <td class="px-3 py-2 text-white/50 text-xs">{{ row._excelRow }}</td>
                                <td class="px-3 py-2"><input v-model="row.employeeId" class="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50" @blur="revalidateRow(idx)" /></td>
                                <td class="px-3 py-2"><input :value="importType === 'shift' ? row.shiftId : row.weeklyOffPolicyId" @input="onPolicyIdInput(row, $event)" class="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50" @blur="revalidateRow(idx)" /></td>
                                <td class="px-3 py-2"><input v-model="row.startDate" type="date" class="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50" @blur="revalidateRow(idx)" /></td>
                                <td class="px-3 py-2"><input v-model="row.endDate" type="date" class="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50" @blur="revalidateRow(idx)" /></td>
                                <td class="px-3 py-2">
                                    <span v-if="!row._errors?.length" class="inline-flex items-center gap-1 text-xs text-emerald-400"><Icon name="ion:checkmark-circle" class="w-3.5 h-3.5" /> Valid</span>
                                    <span v-else class="inline-flex items-center gap-1 text-xs text-rose-400"><Icon name="ion:alert-circle" class="w-3.5 h-3.5" /> Error</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-if="errorCount > 0" class="mt-4 space-y-2">
                    <div v-for="(row, idx) in parsedRows.filter(r => r._errors?.length)" :key="'err-' + idx" class="rounded-lg bg-rose-500/5 border border-rose-500/20 px-4 py-2">
                        <p class="text-xs font-semibold text-rose-400 mb-1">Row {{ row._excelRow }}</p>
                        <ul class="text-xs text-rose-300 space-y-0.5">
                            <li v-for="(err, ei) in row._errors" :key="ei">{{ err }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- SUCCESS STATE -->
        <div v-if="importSuccess" class="rounded-lg p-8 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex-1 flex flex-col items-center justify-center text-center">
            <Icon name="ion:checkmark-circle" class="w-16 h-16 text-emerald-400 mb-4" />
            <h3 class="text-lg font-semibold text-white/90 mb-2">Import Successful</h3>
            <p class="text-sm text-white/60">{{ importedCount }} assignment(s) imported successfully.</p>
            <p class="text-xs text-white/40 mt-2">Redirecting...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const organizationId = computed(() => route.params.organization)
const importType = computed(() => route.query.type === 'weekly-off' ? 'weekly-off' : 'shift')

const goBack = () => {
    navigateTo(`/organization/${organizationId.value}/attendance/shifts`)
}

const currentStep = ref(1)
const fileInput = ref(null)
const uploading = ref(false)
const uploadError = ref('')
const submitting = ref(false)
const backendError = ref('')
const importSuccess = ref(false)
const importedCount = ref(0)

const downloadTemplate = () => {
    const apiBase = useRuntimeConfig().public?.apiBase || ''
    const endpoint = importType.value === 'shift' ? '/shift-assignments/template' : '/weekly-off/assignments/template'
    window.open(`${apiBase}${endpoint}`, '_blank')
}

const triggerUpload = () => {
    uploadError.value = ''
    fileInput.value?.click()
}

const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    uploadError.value = ''
    uploading.value = true

    try {
        const data = await file.arrayBuffer()
        let wb
        try { wb = XLSX.read(data, { type: 'array' }) } catch { uploadError.value = 'Could not read the file.'; return }

        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]
        if (!ws) { uploadError.value = 'The first worksheet is empty.'; return }

        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        if (!jsonData || jsonData.length === 0) { uploadError.value = 'The worksheet is empty.'; return }

        const REQUIRED_FIELDS = importType.value === 'shift'
            ? ['employee id', 'shift id', 'start date']
            : ['employee id', 'weekly off policy id', 'effective from']

        let headerRowIndex = -1
        for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
            const row = jsonData[i]
            if (!row || row.length === 0) continue
            const normalized = row.map(h => String(h).trim().toLowerCase().replace(/[\s_-]+/g, ' '))
            const hasRequired = REQUIRED_FIELDS.every(f => normalized.some(n => n.includes(f)))
            if (hasRequired) { headerRowIndex = i; break }
        }

        if (headerRowIndex === -1) {
            uploadError.value = `Could not detect required columns. Ensure the file contains: ${REQUIRED_FIELDS.join(', ')}`
            return
        }

        rawHeaders.value = jsonData[headerRowIndex].map(h => String(h).trim())
        rawRows.value = jsonData.slice(headerRowIndex + 1).filter(row => row && row.some(cell => String(cell).trim() !== ''))
        if (rawRows.value.length === 0) { uploadError.value = 'No data rows found.'; return }

        detectedColumns.value = detectColumns(rawHeaders.value)
        columnMappings.value = detectedColumns.value.map(col => col.suggestedMapping || 'ignore')
        currentStep.value = 2
    } catch (err) {
        uploadError.value = 'An unexpected error occurred.'
        console.error('[shift-import] Upload error:', err)
    } finally {
        uploading.value = false
        if (fileInput.value) fileInput.value.value = ''
    }
}

const rawHeaders = ref([])
const rawRows = ref([])
const detectedColumns = ref([])
const columnMappings = ref([])
const mappingErrors = ref([])

const excelColumns = computed(() => detectedColumns.value.map((col, idx) => ({
    name: col.originalName,
    sample: String(col.sampleValue || '—'),
    mapping: columnMappings.value[idx],
})))

const FIELD_ALIASES = importType.value === 'shift' ? {
    employeeId: ['employee id', 'employeeid', 'employee_id', 'employee-id', 'emp id', 'empid', 'emp_id'],
    shiftId: ['shift id', 'shiftid', 'shift_id', 'shift-id'],
    startDate: ['start date', 'startdate', 'start_date', 'start-date', 'valid from', 'validfrom', 'valid_from'],
    endDate: ['end date', 'enddate', 'end_date', 'end-date', 'valid to', 'validto', 'valid_to'],
} : {
    employeeId: ['employee id', 'employeeid', 'employee_id', 'employee-id', 'emp id', 'empid', 'emp_id'],
    weeklyOffPolicyId: ['weekly off policy id', 'weeklyoffpolicyid', 'weekly_off_policy_id', 'policy id', 'policyid', 'policy_id'],
    startDate: ['effective from', 'effectivefrom', 'effective_from', 'start date', 'startdate', 'start_date'],
    endDate: ['effective to', 'effectiveto', 'effective_to', 'end date', 'enddate', 'end_date'],
}

const detectColumns = (headers) => {
    return headers.map(h => {
        const norm = h.toLowerCase().replace(/[\s_-]+/g, ' ').trim()
        let suggestedMapping = 'ignore'
        for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
            if (aliases.includes(norm)) { suggestedMapping = field; break }
        }
        const sampleValue = rawRows.value.map(row => row[headers.indexOf(h)]).filter(v => v != null && String(v).trim()).slice(0, 1)[0] || ''
        return { originalName: h, normalized: norm, suggestedMapping, sampleValue }
    })
}

const isMappedElsewhere = (field, currentIdx) => columnMappings.value.some((m, i) => m === field && i !== currentIdx)

const requiredFields = computed(() => importType.value === 'shift'
    ? ['employeeId', 'shiftId', 'startDate']
    : ['employeeId', 'weeklyOffPolicyId', 'startDate'])

const isMappingValid = computed(() => {
    const allRequired = requiredFields.value.every(f => columnMappings.value.some(m => m === f))
    const targets = columnMappings.value.filter(m => m !== 'ignore')
    return allRequired && new Set(targets).size === targets.length
})

const parsedRows = ref([])
const validCount = computed(() => parsedRows.value.filter(r => !r._errors?.length).length)
const errorCount = computed(() => parsedRows.value.filter(r => r._errors?.length > 0).length)

const normalizeDateSafe = (val) => {
    if (!val && val !== 0) return null
    if (val instanceof Date) { const y = val.getFullYear(), m = String(val.getMonth()+1).padStart(2,'0'), d = String(val.getDate()).padStart(2,'0'); return `${y}-${m}-${d}` }
    if (typeof val === 'number') { const utcDays = Math.floor(val) - 25569, d = new Date(utcDays * 86400000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}` }
    const str = String(val).trim()
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`
    const parsed = new Date(str)
    if (!isNaN(parsed.getTime())) { return `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}` }
    return null
}

const validateRow = (row) => {
    const errors = []
    if (!row.employeeId || !String(row.employeeId).trim()) errors.push('Employee ID is required.')
    if (importType.value === 'shift') {
        if (!row.shiftId || !String(row.shiftId).trim()) errors.push('Shift ID is required.')
    } else {
        if (!row.weeklyOffPolicyId || !String(row.weeklyOffPolicyId).trim()) errors.push('Weekly Off Policy ID is required.')
    }
    if (!row.startDate || String(row.startDate).trim() === '') {
        errors.push(`${importType.value === 'shift' ? 'Start Date' : 'Effective From'} is required.`)
    } else if (!normalizeDateSafe(row.startDate)) {
        errors.push('Invalid date format. Use YYYY-MM-DD.')
    }
    if (row.endDate && !normalizeDateSafe(row.endDate)) {
        errors.push('Invalid end date format. Use YYYY-MM-DD.')
    }
    return errors
}

const buildParsedRows = () => {
    const empIdx = columnMappings.value.indexOf('employeeId')
    const idIdx = columnMappings.value.indexOf(importType.value === 'shift' ? 'shiftId' : 'weeklyOffPolicyId')
    const startIdx = columnMappings.value.indexOf('startDate')
    const endIdx = columnMappings.value.indexOf('endDate')

    parsedRows.value = rawRows.value.map((row, i) => {
        const r = {
            _excelRow: i + 2,
            employeeId: empIdx >= 0 ? String(row[empIdx] || '').trim() : '',
            shiftId: importType.value === 'shift' ? (idIdx >= 0 ? String(row[idIdx] || '').trim() : '') : '',
            weeklyOffPolicyId: importType.value !== 'shift' ? (idIdx >= 0 ? String(row[idIdx] || '').trim() : '') : '',
            startDate: startIdx >= 0 ? normalizeDateSafe(row[startIdx]) || '' : '',
            endDate: endIdx >= 0 ? normalizeDateSafe(row[endIdx]) || '' : '',
            _errors: [],
        }
        r._errors = validateRow(r)
        return r
    })
}

const revalidateRow = (idx) => {
    const row = parsedRows.value[idx]
    if (!row) return
    row._errors = validateRow(row)
}

const onPolicyIdInput = (row, e) => {
    if (importType.value === 'shift') row.shiftId = e.target.value
    else row.weeklyOffPolicyId = e.target.value
}

const goToStep = (step) => {
    if (step === 1) {
        currentStep.value = 1; rawHeaders.value = []; rawRows.value = []; detectedColumns.value = []; columnMappings.value = []; parsedRows.value = []; mappingErrors.value = []; uploadError.value = ''; backendError.value = ''; importSuccess.value = false
    } else if (step === 2 && detectedColumns.value.length > 0) {
        currentStep.value = 2; backendError.value = ''
    } else if (step === 3 && parsedRows.value.length > 0) {
        currentStep.value = 3; backendError.value = ''
    }
}

const validateAndGoToReview = () => {
    mappingErrors.value = []
    const allRequired = requiredFields.value.every(f => columnMappings.value.some(m => m === f))
    if (!allRequired) mappingErrors.value.push('All required fields must be mapped.')
    if (mappingErrors.value.length > 0) return
    buildParsedRows()
    currentStep.value = 3
}

const submitImport = async () => {
    if (submitting.value || errorCount.value > 0) return
    submitting.value = true
    backendError.value = ''

    try {
        const { $api } = useNuxtApp()
        const items = parsedRows.value
            .filter(r => !r._errors?.length)
            .map(r => {
                if (importType.value === 'shift') {
                    return { employee_id: r.employeeId, shift_id: r.shiftId, valid_from: r.startDate, valid_to: r.endDate || '' }
                } else {
                    return { employee_id: r.employeeId, weekly_off_policy_id: r.weeklyOffPolicyId, effective_from: r.startDate, effective_to: r.endDate || '' }
                }
            })

        const endpoint = importType.value === 'shift' ? '/shift-assignments/import' : '/weekly-off/assignments/import'
        const response = await $api.post(endpoint, { organization_id: organizationId.value, items })

        if (response.data?.success) {
            importSuccess.value = true
            importedCount.value = response.data.processed || 0
            setTimeout(() => navigateTo(`/organization/${organizationId.value}/attendance/shifts`), 2000)
        } else {
            backendError.value = response.data?.error || response.data?.message || 'Import failed.'
        }
    } catch (err) {
        backendError.value = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Import failed.'
    } finally {
        submitting.value = false
    }
}
</script>
