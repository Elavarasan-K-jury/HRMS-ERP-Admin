<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">

        <!-- HEADER -->
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="goBack"
                    class="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                    <Icon name="ion:arrow-back" class="w-5 h-5" />
                </button>
                <div>
                    <h2 class="text-lg font-semibold text-white/90">Import Holidays</h2>
                    <p class="text-xs text-white/50">{{ policyName }}</p>
                </div>
            </div>
        </div>

        <!-- STEP INDICATOR -->
        <div class="flex items-center justify-center gap-0 py-3">
            <div class="flex items-center gap-2 cursor-pointer" @click="goToStep(1)">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors"
                    :class="currentStep > 1
                        ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-400'
                        : currentStep === 1
                            ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-400'
                            : 'bg-white/5 border border-white/15 text-white/40'">
                    <Icon v-if="currentStep > 1" name="ion:checkmark" class="w-3.5 h-3.5" />
                    <span v-else>1</span>
                </span>
                <span class="text-xs font-medium" :class="currentStep >= 1 ? (currentStep > 1 ? 'text-emerald-400' : 'text-indigo-400') : 'text-white/40'">Upload</span>
            </div>
            <div class="w-8 h-px mx-2" :class="currentStep > 1 ? 'bg-emerald-400/50' : 'bg-white/15'"></div>
            <div class="flex items-center gap-2 cursor-pointer" @click="goToStep(2)">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors"
                    :class="currentStep > 2
                        ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-400'
                        : currentStep === 2
                            ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-400'
                            : 'bg-white/5 border border-white/15 text-white/40'">
                    <Icon v-if="currentStep > 2" name="ion:checkmark" class="w-3.5 h-3.5" />
                    <span v-else>2</span>
                </span>
                <span class="text-xs font-medium" :class="currentStep >= 2 ? (currentStep > 2 ? 'text-emerald-400' : 'text-indigo-400') : 'text-white/40'">Map Columns</span>
            </div>
            <div class="w-8 h-px mx-2" :class="currentStep > 2 ? 'bg-emerald-400/50' : 'bg-white/15'"></div>
            <div class="flex items-center gap-2 cursor-pointer" @click="goToStep(3)">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors"
                    :class="currentStep === 3
                        ? 'bg-indigo-500/20 border border-indigo-400/50 text-indigo-400'
                        : 'bg-white/5 border border-white/15 text-white/40'">
                    <span>3</span>
                </span>
                <span class="text-xs font-medium" :class="currentStep >= 3 ? 'text-indigo-400' : 'text-white/40'">Review &amp; Import</span>
            </div>
        </div>

        <!-- STEP 1: UPLOAD -->
        <div v-if="currentStep === 1"
            class="rounded-lg p-6 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex-1">
            <div class="max-w-2xl mx-auto">
                <h3 class="text-sm font-semibold text-white/90 mb-4">Upload your Excel file</h3>

                <div class="space-y-4 mb-6">
                    <div class="flex items-start gap-3">
                        <span
                            class="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-xs font-semibold text-emerald-400 shrink-0 mt-0.5">1</span>
                        <div>
                            <p class="text-sm text-white/80">Download the Excel Template</p>
                            <p class="text-xs text-white/50 mt-0.5">Get the pre-formatted template with the correct column headers.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span
                            class="w-6 h-6 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-xs font-medium text-white/40 shrink-0 mt-0.5">2</span>
                        <div>
                            <p class="text-sm text-white/80">Read the upload instructions</p>
                            <p class="text-xs text-white/50 mt-0.5">Ensure your data follows the required format and field rules.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span
                            class="w-6 h-6 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-xs font-medium text-white/40 shrink-0 mt-0.5">3</span>
                        <div>
                            <p class="text-sm text-white/80">Fill in the information in the Excel template</p>
                            <p class="text-xs text-white/50 mt-0.5">Add your holiday data to the downloaded template file.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <span
                            class="w-6 h-6 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-xs font-medium text-white/40 shrink-0 mt-0.5">4</span>
                        <div>
                            <p class="text-sm text-white/80">Upload the Excel sheet</p>
                            <p class="text-xs text-white/50 mt-0.5">Select the completed file to begin the import process.</p>
                        </div>
                    </div>
                </div>

                <div class="rounded-lg bg-white/5 border border-white/10 p-4 mb-6">
                    <h4 class="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">Upload Instructions</h4>
                    <ul class="text-xs text-white/60 space-y-1.5">
                        <li class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span><strong class="text-white/80">Name</strong> is required. Each holiday must have a name.</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span><strong class="text-white/80">Date</strong> is required. Use the format <code class="bg-white/10 px-1 py-0.5 rounded">YYYY-MM-DD</code> (e.g. 2026-01-01).</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span><strong class="text-white/80">Leave Optional</strong> is optional. Use <code class="bg-white/10 px-1 py-0.5 rounded">Yes</code> or <code class="bg-white/10 px-1 py-0.5 rounded">No</code>. Defaults to No.</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-emerald-400 mt-0.5">&#8226;</span>
                            <span>Only the <strong class="text-white/80">first sheet</strong> in the workbook will be processed.</span>
                        </li>
                    </ul>
                </div>

                <!-- Upload error -->
                <div v-if="uploadError" class="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 mb-4">
                    <p class="text-sm text-rose-400">{{ uploadError }}</p>
                </div>

                <div class="flex items-center gap-3">
                    <UiButton color="#4aff7a" text="Download Excel Template" prepend-icon="ion:download-outline"
                        @click="downloadTemplate" />
                    <UiButton color="#fff" text="Upload Excel File" prepend-icon="ion:cloud-upload-outline"
                        @click="triggerUpload" :loading="uploading" />
                    <input ref="fileInput" type="file" accept=".xlsx" class="hidden" @change="handleFileUpload" />
                </div>
            </div>
        </div>

        <!-- STEP 2: MAP COLUMNS -->
        <div v-if="currentStep === 2" class="flex-1">
            <div class="mb-4">
                <h3 class="text-sm font-semibold text-white/90 mb-1">Columns Found in Excel</h3>
                <p class="text-xs text-white/50">Match your Excel columns to the required Holiday fields.</p>
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
                            <th class="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-1/4">Column Name In Excel</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-1/3">First Data Record In Excel</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-1/3">Match To Field</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(col, idx) in excelColumns" :key="idx"
                            class="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td class="px-4 py-3">
                                <span class="font-medium text-white">{{ col.name }}</span>
                            </td>
                            <td class="px-4 py-3 text-white/60 text-xs">{{ col.sample }}</td>
                            <td class="px-4 py-3">
                                <select v-model="columnMappings[idx]"
                                    class="w-full max-w-xs rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50">
                                    <option value="ignore" class="bg-[#1a1d27]">Ignore</option>
                                    <option value="name" class="bg-[#1a1d27]" :disabled="isMappedElsewhere('name', idx)">Name *</option>
                                    <option value="date" class="bg-[#1a1d27]" :disabled="isMappedElsewhere('date', idx)">Date *</option>
                                    <option value="leaveOptional" class="bg-[#1a1d27]" :disabled="isMappedElsewhere('leaveOptional', idx)">Leave Optional</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex items-center gap-3">
                <UiButton color="#fff" text="Back" prepend-icon="ion:arrow-back" @click="goToStep(1)" />
                <UiButton color="#4aff7a" text="Continue" prepend-icon="ion:arrow-forward" @click="validateAndGoToReview"
                    :disabled="!isMappingValid" />
            </div>
        </div>

        <!-- STEP 3: REVIEW -->
        <div v-if="currentStep === 3 && !importSuccess"
            class="rounded-lg bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex-1 flex flex-col overflow-hidden">

            <!-- Summary bar -->
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
                    <UiButton color="#4aff7a" text="Import Holidays" prepend-icon="ion:cloud-upload"
                        :loading="submitting" :disabled="errorCount > 0 || submitting" size="sm"
                        @click="submitImport" />
                </div>
            </div>

            <!-- Backend error banner -->
            <div v-if="backendError"
                class="mx-6 mt-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 shrink-0">
                <p class="text-sm text-rose-400">{{ backendError }}</p>
            </div>

            <!-- Validation error banner -->
            <div v-if="errorCount > 0 && !backendError"
                class="mx-6 mt-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 shrink-0">
                <p class="text-sm text-rose-400">Please fix all validation errors before continuing.</p>
            </div>

            <!-- Review table -->
            <div class="flex-1 overflow-auto p-6">
                <div class="rounded-lg border border-white/15 overflow-hidden">
                    <table class="min-w-full text-sm text-white/90">
                        <thead class="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
                            <tr>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-16">Row</th>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">Name</th>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">Date</th>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide">Leave Optional</th>
                                <th class="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wide w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, idx) in parsedRows" :key="idx"
                                class="border-b border-white/5 hover:bg-white/5 transition-colors"
                                :class="row._errors && row._errors.length ? 'bg-rose-500/5' : ''">
                                <td class="px-3 py-2 text-white/50 text-xs">{{ row._excelRow }}</td>
                                <td class="px-3 py-2">
                                    <input v-model="row.name" type="text"
                                        class="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                                        @blur="revalidateRow(idx)" />
                                </td>
                                <td class="px-3 py-2">
                                    <input v-model="row.date" type="date"
                                        class="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                                        @blur="revalidateRow(idx)" />
                                </td>
                                <td class="px-3 py-2">
                                    <select v-model="row.leaveOptional"
                                        class="w-full rounded border border-white/15 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                                        @change="revalidateRow(idx)">
                                        <option :value="false" class="bg-[#1a1d27]">No</option>
                                        <option :value="true" class="bg-[#1a1d27]">Yes</option>
                                    </select>
                                </td>
                                <td class="px-3 py-2">
                                    <span v-if="!row._errors || row._errors.length === 0"
                                        class="inline-flex items-center gap-1 text-xs text-emerald-400">
                                        <Icon name="ion:checkmark-circle" class="w-3.5 h-3.5" /> Valid
                                    </span>
                                    <span v-else class="inline-flex items-center gap-1 text-xs text-rose-400">
                                        <Icon name="ion:alert-circle" class="w-3.5 h-3.5" /> Error
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Error details -->
                <div v-if="errorCount > 0" class="mt-4 space-y-2">
                    <div v-for="(row, idx) in parsedRows.filter(r => r._errors && r._errors.length)" :key="'err-' + idx"
                        class="rounded-lg bg-rose-500/5 border border-rose-500/20 px-4 py-2">
                        <p class="text-xs font-semibold text-rose-400 mb-1">Row {{ row._excelRow }}</p>
                        <ul class="text-xs text-rose-300 space-y-0.5">
                            <li v-for="(err, ei) in row._errors" :key="ei">{{ err }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- SUCCESS STATE -->
        <div v-if="importSuccess"
            class="rounded-lg p-8 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex-1 flex flex-col items-center justify-center text-center">
            <Icon name="ion:checkmark-circle" class="w-16 h-16 text-emerald-400 mb-4" />
            <h3 class="text-lg font-semibold text-white/90 mb-2">Import Successful</h3>
            <p class="text-sm text-white/60">{{ importedCount }} holiday{{ importedCount !== 1 ? 's' : '' }} imported successfully.</p>
            <p class="text-xs text-white/40 mt-2">Redirecting to Holiday Policy...</p>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'

import { useAuthStore } from '../../../../stores/shared/auth.store'
import { useHolidayPolicyStore } from '../../../../stores/organization/holidayPolicy.store'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const authStore = useAuthStore()
const policyStore = useHolidayPolicyStore()

const organizationId = computed(() => route.params.organization || authStore.organization)
const policyId = computed(() => route.query.policy_id || '')
const policyName = computed(() => {
    const policy = policyStore.policies.find(p => p.id === policyId.value)
    return policy?.name || 'Holiday Policy'
})

const goBack = () => {
    const orgId = organizationId.value
    navigateTo(`/organization/${orgId}/attendance/shifts`)
}

/* ============================================================
   STEP STATE
============================================================ */
const currentStep = ref(1)
const fileInput = ref(null)
const uploading = ref(false)
const uploadError = ref('')
const submitting = ref(false)
const backendError = ref('')
const importSuccess = ref(false)
const importedCount = ref(0)

/* ============================================================
   STEP 1 — UPLOAD
============================================================ */
const downloadTemplate = () => {
    const a = document.createElement('a')
    a.href = '/templates/holiday_import_template.xlsx'
    a.download = 'holiday_import_template.xlsx'
    a.click()
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
        if (!file.name.endsWith('.xlsx')) {
            uploadError.value = 'Only .xlsx files are supported. Please select a valid Excel file.'
            return
        }

        const data = await file.arrayBuffer()
        let wb
        try {
            wb = XLSX.read(data, { type: 'array' })
        } catch {
            uploadError.value = 'Could not read the file. It may be corrupted or not a valid Excel file.'
            return
        }

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
            uploadError.value = 'The workbook contains no worksheets.'
            return
        }

        const wsName = wb.SheetNames[0]
        const ws = wb.Sheets[wsName]
        if (!ws) {
            uploadError.value = 'The first worksheet is empty.'
            return
        }

        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        if (!jsonData || jsonData.length === 0) {
            uploadError.value = 'The worksheet is empty.'
            return
        }

        /* --- Detect header row by scanning for required fields --- */
        const REQUIRED_FIELDS = ['name', 'date']
        const OPTIONAL_FIELDS = ['leave optional']
        let headerRowIndex = -1

        for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
            const row = jsonData[i]
            if (!row || row.length === 0) continue
            const normalized = row.map(h => String(h).trim().toLowerCase().replace(/[\s_-]+/g, ' '))
            const hasRequired = REQUIRED_FIELDS.every(f => normalized.includes(f))
            if (hasRequired) {
                headerRowIndex = i
                break
            }
        }

        if (headerRowIndex === -1) {
            uploadError.value = 'Could not detect column headers. Ensure the file contains Name and Date columns.'
            return
        }

        const headerRow = jsonData[headerRowIndex]
        rawHeaders.value = headerRow.map(h => String(h).trim())

        const dataRows = jsonData.slice(headerRowIndex + 1).filter(row =>
            row && row.some(cell => String(cell).trim() !== '')
        )

        if (dataRows.length === 0) {
            uploadError.value = 'No data rows found. The file must contain at least one row of holiday data.'
            return
        }
        rawRows.value = dataRows
        detectedColumns.value = detectColumns(rawHeaders.value)
        columnMappings.value = detectedColumns.value.map(col => col.suggestedMapping || 'ignore')

        currentStep.value = 2
    } catch (err) {
        uploadError.value = 'An unexpected error occurred while reading the file.'
        console.error('[holiday-import] Upload error:', err)
    } finally {
        uploading.value = false
        if (fileInput.value) fileInput.value.value = ''
    }
}

/* ============================================================
   STEP 2 — COLUMN DETECTION
============================================================ */
const rawHeaders = ref([])
const rawRows = ref([])
const detectedColumns = ref([])
const columnMappings = ref([])
const mappingErrors = ref([])

const excelColumns = computed(() => {
    return detectedColumns.value.map((col, idx) => ({
        name: col.originalName,
        sample: formatSampleValue(col.sampleValue),
        mapping: columnMappings.value[idx],
    }))
})

const formatSampleValue = (val) => {
    if (val === null || val === undefined || val === '') return '—'
    const str = String(val).trim()
    if (str === '') return '—'

    if (val instanceof Date && !isNaN(val.getTime())) {
        const y = val.getFullYear()
        const m = String(val.getMonth() + 1).padStart(2, '0')
        const d = String(val.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    if (typeof val === 'number') {
        const utcDays = Math.floor(val) - 25569
        const utcMs = utcDays * 86400 * 1000
        const d = new Date(utcMs)
        if (!isNaN(d.getTime())) {
            const y = d.getUTCFullYear()
            const m = String(d.getUTCMonth() + 1).padStart(2, '0')
            const day = String(d.getUTCDate()).padStart(2, '0')
            return `${y}-${m}-${day}`
        }
    }

    return str
}

const FIELD_ALIASES = {
    name: ['name', 'holiday name', 'holidayname', 'holiday_name', 'holiday-name'],
    date: ['date', 'holiday date', 'holidaydate', 'holiday_date', 'holiday-date'],
    leaveOptional: ['leave optional', 'leaveoptional', 'leave_optional', 'leave-optional',
        'is leave optional', 'isleaveoptional', 'is_leave_optional', 'is-leave-optional'],
}

const detectColumns = (headers) => {
    const normalizedToOriginal = new Map()
    const normalizedHeaders = headers.map(h => {
        const norm = h.toLowerCase().replace(/[\s_-]+/g, ' ').trim()
        normalizedToOriginal.set(norm, h)
        return norm
    })

    return normalizedHeaders.map((norm, idx) => {
        let suggestedMapping = 'ignore'
        for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
            if (aliases.includes(norm)) {
                suggestedMapping = field
                break
            }
        }
        const sampleValues = rawRows.value
            .map(row => row[idx])
            .filter(v => v !== undefined && v !== null && String(v).trim() !== '')
            .slice(0, 3)

        return {
            originalName: headers[idx],
            normalized: norm,
            suggestedMapping,
            sampleValue: sampleValues.length > 0 ? sampleValues[0] : '',
        }
    })
}

const isMappedElsewhere = (field, currentIdx) => {
    return columnMappings.value.some((m, i) => m === field && i !== currentIdx)
}

const isMappingValid = computed(() => {
    const nameMapped = columnMappings.value.some(m => m === 'name')
    const dateMapped = columnMappings.value.some(m => m === 'date')
    const uniqueTargets = columnMappings.value.filter(m => m !== 'ignore')
    const noDuplicates = new Set(uniqueTargets).size === uniqueTargets.length
    return nameMapped && dateMapped && noDuplicates
})

/* ============================================================
   STEP 5-6 — DATA PARSING + VALIDATION
============================================================ */
const parsedRows = ref([])

const validCount = computed(() => parsedRows.value.filter(r => !r._errors || r._errors.length === 0).length)
const errorCount = computed(() => parsedRows.value.filter(r => r._errors && r._errors.length > 0).length)

const normalizeDateSafe = (val) => {
    if (!val && val !== 0) return null

    if (val instanceof Date) {
        const y = val.getFullYear()
        const m = String(val.getMonth() + 1).padStart(2, '0')
        const d = String(val.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    if (typeof val === 'number') {
        const utcDays = Math.floor(val) - 25569
        const utcMs = utcDays * 86400 * 1000
        const d = new Date(utcMs)
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const str = String(val).trim()
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`

    const parsed = new Date(str)
    if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear()
        const m = String(parsed.getMonth() + 1).padStart(2, '0')
        const d = String(parsed.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    return null
}

const parseLeaveOptional = (val) => {
    if (val === null || val === undefined || val === '') return { value: false, valid: true }
    const str = String(val).trim().toLowerCase()
    if (['yes', 'y', 'true', '1'].includes(str)) return { value: true, valid: true }
    if (['no', 'n', 'false', '0', ''].includes(str)) return { value: false, valid: true }
    return { value: null, valid: false }
}

const validateRow = (row) => {
    const errors = []

    const name = row.name !== undefined && row.name !== null ? String(row.name).trim() : ''
    if (!name) errors.push('Name is required.')

    if (!row.date || String(row.date).trim() === '') {
        errors.push('Date is required.')
    } else {
        const normalized = normalizeDateSafe(row.date)
        if (!normalized) errors.push('Invalid date format. Use YYYY-MM-DD.')
    }

    if (row._rawLeaveOptional !== undefined && row._rawLeaveOptional !== '') {
        const result = parseLeaveOptional(row._rawLeaveOptional)
        if (!result.valid) errors.push('Leave Optional must be Yes or No.')
    }

    return errors
}

const buildParsedRows = () => {
    const nameIdx = columnMappings.value.indexOf('name')
    const dateIdx = columnMappings.value.indexOf('date')
    const loIdx = columnMappings.value.indexOf('leaveOptional')

    parsedRows.value = rawRows.value.map((row, i) => {
        const rawName = nameIdx >= 0 ? row[nameIdx] : ''
        const rawDate = dateIdx >= 0 ? row[dateIdx] : ''
        const rawLO = loIdx >= 0 ? row[loIdx] : ''

        const name = rawName !== undefined && rawName !== null ? String(rawName).trim() : ''
        const dateStr = normalizeDateSafe(rawDate)
        const loResult = parseLeaveOptional(rawLO)

        const parsed = {
            _excelRow: i + 2,
            name,
            date: dateStr || '',
            leaveOptional: loResult.value,
            _rawLeaveOptional: rawLO,
            _errors: [],
        }

        parsed._errors = validateRow(parsed)
        return parsed
    })

    detectDuplicates()
}

const revalidateRow = (idx) => {
    const row = parsedRows.value[idx]
    if (!row) return
    row.name = String(row.name || '').trim()
    row._errors = validateRow(row)
    detectDuplicates()
}

/* ============================================================
   STEP 10 — DUPLICATE DETECTION (frontend only)
============================================================ */
const detectDuplicates = () => {
    const seen = new Map()
    parsedRows.value.forEach(row => {
        row._errors = row._errors.filter(e => !e.startsWith('Duplicate'))
    })

    parsedRows.value.forEach(row => {
        if (!row.name || !row.date) return
        const key = `${row.name.toLowerCase()}|${row.date}`
        if (seen.has(key)) {
            const existingIdx = seen.get(key)
            if (!parsedRows.value[existingIdx]._errors.some(e => e.startsWith('Duplicate'))) {
                parsedRows.value[existingIdx]._errors.push(`Duplicate of row ${row._excelRow}.`)
            }
            row._errors.push(`Duplicate of row ${parsedRows.value[existingIdx]._excelRow}.`)
        } else {
            seen.set(key, parsedRows.value.indexOf(row))
        }
    })
}

/* ============================================================
   NAVIGATION
============================================================ */
const goToStep = (step) => {
    if (step === 1) {
        currentStep.value = 1
        rawHeaders.value = []
        rawRows.value = []
        detectedColumns.value = []
        columnMappings.value = []
        parsedRows.value = []
        mappingErrors.value = []
        uploadError.value = ''
        backendError.value = ''
        importSuccess.value = false
    } else if (step === 2 && detectedColumns.value.length > 0) {
        currentStep.value = 2
        backendError.value = ''
    } else if (step === 3 && parsedRows.value.length > 0) {
        currentStep.value = 3
        backendError.value = ''
    }
}

const validateAndGoToReview = () => {
    mappingErrors.value = []
    backendError.value = ''

    const nameMapped = columnMappings.value.some(m => m === 'name')
    const dateMapped = columnMappings.value.some(m => m === 'date')

    if (!nameMapped) mappingErrors.value.push('Name column is required.')
    if (!dateMapped) mappingErrors.value.push('Date column is required.')

    if (mappingErrors.value.length > 0) return

    buildParsedRows()
    currentStep.value = 3
}

/* ============================================================
   SUBMIT IMPORT
============================================================ */
const submitImport = async () => {
    if (submitting.value || errorCount.value > 0) return
    submitting.value = true
    backendError.value = ''

    try {
        const { $api } = useNuxtApp()

        const holidays = parsedRows.value
            .filter(r => !r._errors || r._errors.length === 0)
            .map(r => ({
                name: r.name,
                date: r.date,
                leave_optional: r.leaveOptional,
                _excelRow: r._excelRow,
            }))

        const payload = {
            organization_id: organizationId.value,
            policy_id: policyId.value,
            holidays,
        }

        const response = await $api.post('/holidays/bulk-import', payload)

        if (response.data?.success) {
            importSuccess.value = true
            importedCount.value = response.data.imported_count || 0
            setTimeout(() => {
                const orgId = organizationId.value
                navigateTo(`/organization/${orgId}/attendance/shifts`)
            }, 2000)
        } else {
            backendError.value = response.data?.error || response.data?.message || 'Import failed.'
            if (response.data?.errors && Array.isArray(response.data.errors)) {
                applyBackendErrors(response.data.errors)
            }
        }
    } catch (err) {
        const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Import failed.'
        backendError.value = msg
        if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
            applyBackendErrors(err.response.data.errors)
        }
    } finally {
        submitting.value = false
    }
}

const applyBackendErrors = (backendErrors) => {
    for (const be of backendErrors) {
        const row = parsedRows.value.find(r => r._excelRow === be.row)
        if (row) {
            if (!row._errors) row._errors = []
            const msg = be.field === 'duplicate' ? be.message : `${be.field}: ${be.message}`
            if (!row._errors.includes(msg)) {
                row._errors.push(msg)
            }
        }
    }
}

/* ============================================================
   ON MOUNT
============================================================ */
onMounted(async () => {
    if (policyStore.policies.length === 0) {
        await policyStore.fetchPolicies()
    }
})
</script>
