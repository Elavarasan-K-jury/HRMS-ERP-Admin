<template>
    <UiSidebarModal v-model="open" :title="`Review ${pending?.document_type_name || 'Document'}`" width="720px" :opaque="true">
        <template #subtitle>
            <span class="text-xs text-white/50">Review submitted document and verify or reject.</span>
        </template>
        <template #default>
            <div v-if="loading" class="py-10 flex flex-col items-center gap-2 text-white/50">
                <Icon name="lucide:loader-circle" class="w-6 h-6 animate-spin text-emerald-400" />
                <span class="text-xs">Loading submission detail...</span>
            </div>
            <template v-else>
                <div class="flex flex-col gap-5">
                    <!-- Employee + document summary -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex items-center gap-3">
                            <span class="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center text-sm font-semibold text-white/85">{{ initials(submission?.employee_name) }}</span>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-white/90 truncate">{{ submission?.employee_name }}</p>
                                <p class="text-xs text-white/45 truncate">{{ submission?.employee_code || '' }}{{ submission?.designation ? ' • ' + submission?.designation : '' }}{{ submission?.department ? ' • ' + submission?.department : '' }}</p>
                            </div>
                        </div>
                        <div class="text-sm text-white/80">
                            <p><span class="text-white/45">Folder:</span> {{ submission?.folder_name }}</p>
                            <p><span class="text-white/45">Document:</span> {{ submission?.document_type_name }}</p>
                        </div>
                    </div>

                    <!-- Submission info -->
                    <div class="rounded-xl border border-white/10 bg-white/5 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div class="min-w-0">
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Submitted By</p>
                            <p class="text-white/85 truncate">{{ submission?.submitted_by_name || submission?.submitted_by_id || '—' }}</p>
                        </div>
                        <div>
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Submitted On</p>
                            <p class="text-white/85">{{ formatDateTime(submission?.submitted_at) }}</p>
                        </div>
                        <div>
                            <p class="text-[11px] uppercase tracking-wider text-white/40">Status</p>
                            <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300">Pending Verification</span>
                        </div>
                    </div>

                    <!-- N/A -->
                    <div v-if="submission?.is_na" class="rounded-xl border border-amber-400/20 bg-amber-500/10 p-4">
                        <p class="text-sm font-semibold text-amber-200">Not Applicable</p>
                        <p class="text-xs text-white/60 mt-1">The employee marked this document as Not Applicable. No file is required.</p>
                    </div>

                    <!-- Change tracking: Previous Version Comparison -->
                    <template v-if="!submission?.is_na && changeList.length > 0">
                        <div class="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4">
                            <div class="flex items-center justify-between mb-3">
                                <p class="text-sm font-semibold text-blue-300">Changes from Previous Version</p>
                                <span class="text-[11px] text-blue-400/80 bg-blue-500/15 px-2 py-0.5 rounded-full">{{ changeList.length }} change{{ changeList.length !== 1 ? 's' : '' }}</span>
                            </div>
                            <div class="flex flex-col gap-3">
                                <div v-for="ch in changeList" :key="ch.field_key" class="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                    <p class="text-xs font-medium text-white/70">{{ ch.label }}</p>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                                            <p class="text-[10px] uppercase tracking-wider text-white/35 mb-0.5">Before</p>
                                            <p class="text-xs text-white/70 break-words">{{ ch.old_display }}</p>
                                        </div>
                                        <div class="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                                            <p class="text-[10px] uppercase tracking-wider text-white/35 mb-0.5">After</p>
                                            <p class="text-xs text-white/90 break-words">{{ ch.new_display }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- First-time submission label (no previous version) -->
                    <template v-if="!submission?.is_na && isFirstSubmission">
                        <div class="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                            <p class="text-sm font-semibold text-emerald-300">New Submission</p>
                            <p class="text-xs text-white/50 mt-1">This is the first submission for this document. No previous version to compare.</p>
                        </div>
                    </template>

                    <!-- No changes detected -->
                    <template v-if="!submission?.is_na && !isFirstSubmission && changeList.length === 0 && hasPreviousSubmission">
                        <div class="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
                            <p class="text-sm font-semibold text-amber-300">No Changes Detected</p>
                            <p class="text-xs text-white/50 mt-1">The submitted values are identical to the previous verified version.</p>
                        </div>
                    </template>

                    <!-- Dynamic field values -->
                    <template v-if="!submission?.is_na && fields.length">
                        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p class="text-sm font-semibold text-white/85 mb-3">Submission Details</p>
                            <div class="flex flex-col gap-2.5">
                                <div v-for="f in fields" :key="f.id || f.key" class="flex items-start justify-between gap-3 border-b border-white/5 pb-2">
                                    <span class="text-sm text-white/60">{{ f.label }}</span>
                                    <span class="text-sm text-white/90 text-right max-w-[60%] break-words">{{ displayFieldValue(f) }}</span>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- File -->
                    <div v-if="!submission?.is_na" class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm font-semibold text-white/85 mb-3">Document File</p>
                        <div v-if="submission?.file_id">
                            <!-- Image preview -->
                            <div v-if="isImage(submission?.file_type)" class="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                <img :src="resolveMediaUrl(submission?.file_url)" :alt="submission?.file_name || 'Document'" class="max-w-full max-h-80 object-contain mx-auto" @error="imgError = true" />
                                <p v-if="imgError" class="text-xs text-rose-400 text-center py-3">Failed to load image.</p>
                            </div>
                            <!-- PDF preview -->
                            <div v-else-if="isPdf(submission?.file_type)" class="rounded-lg overflow-hidden border border-white/10 bg-white/5">
                                <iframe :src="resolveMediaUrl(submission?.file_url)" class="w-full h-96" frameborder="0"></iframe>
                            </div>
                            <!-- Other file -->
                            <div v-else class="flex items-center gap-3">
                                <Icon name="ion:document-attach-outline" class="w-6 h-6 text-emerald-300" />
                                <div class="min-w-0 flex-1">
                                    <p class="text-sm text-white/85 truncate">{{ submission?.file_name || 'Document file' }}</p>
                                    <p class="text-xs text-white/45">{{ submission?.file_type || '' }}</p>
                                </div>
                                <a :href="resolveMediaUrl(submission?.file_url)" class="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-2">View / Download</a>
                            </div>
                        </div>
                        <p v-else class="text-xs text-white/40">No file attached.</p>
                    </div>

                    <!-- Expiry -->
                    <div v-if="submission?.expiry_date" class="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p class="text-sm text-white/80"><span class="text-white/45">Expiry Date:</span> {{ formatDateTime(submission?.expiry_date) }}</p>
                    </div>

                    <!-- Rejection form -->
                    <div v-if="rejecting" class="rounded-xl border border-rose-400/20 bg-rose-500/5 p-4 flex flex-col gap-3">
                        <p class="text-sm font-semibold text-rose-300">Rejection Reason <span class="text-rose-400">*</span></p>
                        <textarea v-model="rejectReason" rows="3" placeholder="Explain why this document is being rejected..."
                            class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-rose-400/50 resize-none"></textarea>
                        <p v-if="rejectError" class="text-xs text-rose-400">{{ rejectError }}</p>
                        <div class="flex items-center gap-2">
                            <UiButton @click="rejecting = false" color="#fff" text="Cancel" size="sm" :disabled="saving" />
                            <UiButton @click="confirmReject" color="#750d0d" text="Confirm Reject" size="sm" :disabled="saving || !rejectReason.trim()" :loading="saving" />
                        </div>
                    </div>
                </div>
            </template>
        </template>
        <template #footer>
            <div class="flex items-center gap-2 flex-1">
                <template v-if="!rejecting">
                    <UiButton @click="open = false" color="#fff" text="Close" prepend-icon="ion:close-circle" :disabled="saving" />
                    <UiButton @click="startReject" color="#f87171" text="Reject" prepend-icon="ion:close-circle" :disabled="saving" />
                    <UiButton @click="confirmVerify" color="#4aff7a" text="Verify Document" prepend-icon="ion:checkmark-circle" :disabled="saving" :loading="saving" class="ml-auto" />
                </template>
            </div>
        </template>
    </UiSidebarModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEmployeeDocumentStore } from '~/stores/organization/employeeDocument.store'
import { resolveMediaUrl } from '~/utils/media'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    pending: { type: Object, default: null },
    organizationId: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'actioned'])

const store = useEmployeeDocumentStore()
const open = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })

const loading = ref(false)
const saving = ref(false)
const rejecting = ref(false)
const rejectReason = ref('')
const rejectError = ref('')
const submission = ref(null)
const previousSubmission = ref(null)
const fields = ref([])
const imgError = ref(false)

function initials(name) { return String(name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() }
function formatDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function formatDateOnly(d) { if (!d) return '—'; return new Date(d).toLocaleDateString() }
function isImage(type) { return /^image\//.test(type || '') }
function isPdf(type) { return /^application\/pdf/.test(type || '') }

function displayFieldValue(f, target) {
    const src = target || submission.value
    const v = src?.field_values?.[f.key]
    if (f.field_type === 'DATE' && v) return formatDateOnly(v)
    if (f.field_type === 'DROPDOWN') return v || '—'
    if (f.field_type === 'MULTI_SELECT') return Array.isArray(v) ? v.join(', ') : (v || '—')
    return v !== undefined && v !== null && v !== '' ? String(v) : '—'
}

function maskSensitiveValue(val, fieldKey) {
    const sensitiveKeys = ['aadhaar', 'pan', 'passport', 'ssn', 'national_id']
    if (!sensitiveKeys.includes(fieldKey)) return val
    if (!val || val === '—') return val
    const s = String(val)
    if (s.length <= 4) return '••••'
    return '•'.repeat(s.length - 4) + s.slice(-4)
}

function normalizeValue(v) {
    if (v === undefined || v === null) return ''
    if (typeof v === 'string') return v.trim()
    if (Array.isArray(v)) return v.join(',')
    return String(v)
}

function compareDateValues(oldVal, newVal) {
    if (!oldVal && !newVal) return false
    if (!oldVal || !newVal) return true
    try {
        const d1 = new Date(oldVal).toISOString().slice(0, 10)
        const d2 = new Date(newVal).toISOString().slice(0, 10)
        return d1 !== d2
    } catch {
        return normalizeValue(oldVal) !== normalizeValue(newVal)
    }
}

const isFirstSubmission = computed(() => !previousSubmission.value)

const hasPreviousSubmission = computed(() => !!previousSubmission.value)

const changeList = computed(() => {
    if (!previousSubmission.value || !submission.value) return []
    const changes = []
    const oldSub = previousSubmission.value
    const newSub = submission.value

    // Compare dynamic fields
    for (const f of fields.value) {
        const oldVal = oldSub.field_values?.[f.key]
        const newVal = newSub.field_values?.[f.key]

        let isChanged = false
        if (f.field_type === 'DATE') {
            isChanged = compareDateValues(oldVal, newVal)
        } else {
            isChanged = normalizeValue(oldVal) !== normalizeValue(newVal)
        }

        if (isChanged) {
            const oldDisplay = displayFieldValue(f, oldSub)
            const newDisplay = displayFieldValue(f, newSub)
            changes.push({
                field_key: f.key,
                label: f.label,
                old_value: oldVal,
                new_value: newVal,
                old_display: maskSensitiveValue(oldDisplay, f.key),
                new_display: maskSensitiveValue(newDisplay, f.key),
                change_type: (!oldVal || oldVal === '') ? 'ADDED' : (!newVal || newVal === '') ? 'REMOVED' : 'CHANGED',
            })
        }
    }

    // Compare attachment
    const oldFileName = oldSub.file_name || ''
    const newFileName = newSub.file_name || ''
    if (oldFileName !== newFileName) {
        changes.push({
            field_key: '_attachment',
            label: 'Attachment',
            old_value: oldFileName,
            new_value: newFileName,
            old_display: oldFileName || 'None',
            new_display: newFileName || 'None',
            change_type: !oldFileName ? 'ADDED' : !newFileName ? 'REMOVED' : 'CHANGED',
        })
    }

    // Compare expiry date
    if (submission.value?.expiry_date || oldSub?.expiry_date) {
        const oldExpiry = oldSub?.expiry_date || ''
        const newExpiry = newSub?.expiry_date || ''
        if (compareDateValues(oldExpiry, newExpiry)) {
            changes.push({
                field_key: '_expiry',
                label: 'Expiry Date',
                old_value: oldExpiry,
                new_value: newExpiry,
                old_display: formatDateOnly(oldExpiry),
                new_display: formatDateOnly(newExpiry),
                change_type: !oldExpiry ? 'ADDED' : !newExpiry ? 'REMOVED' : 'CHANGED',
            })
        }
    }

    return changes
})

async function loadSubmission() {
    loading.value = true
    try {
        submission.value = await store.getSubmission(props.pending.submission_id, { organization_id: props.organizationId })
        fields.value = submission.value?.fields || []
        previousSubmission.value = submission.value?._previousSubmission || null
    } catch (e) {
        console.error('[review] load error:', e)
    } finally {
        loading.value = false
    }
}

function startReject() {
    rejecting.value = true
    rejectError.value = ''
}

async function confirmVerify() {
    if (!submission.value || saving.value) return
    saving.value = true
    try {
        await store.verifySubmission(submission.value.id, undefined, props.organizationId)
        open.value = false
        emit('actioned')
    } catch (e) {
        // store toast
    } finally {
        saving.value = false
    }
}

async function confirmReject() {
    if (!submission.value || saving.value) return
    const reason = rejectReason.value.trim()
    if (!reason) { rejectError.value = 'Rejection reason is required'; return }
    saving.value = true
    try {
        await store.rejectSubmission(submission.value.id, reason, undefined, props.organizationId)
        open.value = false
        emit('actioned')
    } catch (e) {
        // store toast
    } finally {
        saving.value = false
    }
}

watch(() => props.modelValue, (v) => {
    if (v) {
        rejecting.value = false
        rejectReason.value = ''
        rejectError.value = ''
        submission.value = null
        previousSubmission.value = null
        fields.value = []
        imgError.value = false
        if (props.pending?.submission_id) loadSubmission()
    }
})
</script>
