<template>
    <section class="card">
        <div class="hdr-row">
            <h2 class="hdr"><Icon name="lucide:briefcase" class="ic" /> Experience</h2>
        </div>

        <div v-if="loading" class="py-6 flex justify-center">
            <Icon name="lucide:loader-circle" class="w-5 h-5 animate-spin text-emerald-400" />
        </div>

        <div v-else-if="!docTypes.length" class="empty-state">
            <Icon name="lucide:briefcase" class="h-10 w-10 text-white/25 mb-3" />
            <p class="text-sm text-white/50">No experience information available.</p>
        </div>

        <div v-else class="space-y-4">
            <template v-for="dt in docTypes" :key="dt.typeId">
                <div v-for="(sub, si) in (dt.submissions.length ? dt.submissions : [null])" :key="sub ? sub.id : `empty-${dt.typeId}-${si}`" class="doc-type-block">
                    <div class="doc-type-header">
                      <div class="flex items-center gap-2">
                          <h3 class="doc-type-name">{{ dt.typeName }}<span v-if="dt.isMultiple && dt.submissions.length > 1" class="text-white/40 text-xs font-normal ml-1">#{{ si + 1 }}</span></h3>
                            <span v-if="sub?.status === 'VERIFIED'" class="status-badge status-green">
                                <Icon name="lucide:check-circle" class="h-3 w-3" /> Verified
                            </span>
                        </div>
                        <button class="edit-btn" :title="'Edit'" :aria-label="'Edit document'" @click="$emit('edit', dt)">
                            <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
                        </button>
                    </div>

                <div v-if="sub" class="doc-fields">
                    <template v-if="hasFieldValues(sub)">
                        <div v-for="field in getVisibleFields(sub)" :key="field.key" class="field-row">
                            <span class="label">{{ field.label }}</span>
                            <span class="value">{{ formatFieldValue(sub.field_values, field) }}</span>
                        </div>
                    </template>

                    <div v-if="sub.file_name" class="file-row">
                        <div class="file-info">
                            <Icon name="lucide:file-text" class="h-4 w-4 text-emerald-400/70" />
                            <span class="text-sm text-white/80 truncate">{{ sub.file_name }}</span>
                        </div>
                        <button class="lnk-btn" @click="$emit('download', sub)">
                            <Icon name="lucide:download" class="h-4 w-4" /> Download
                        </button>
                    </div>
                </div>

                <div v-else class="not-submitted">
                    <p class="text-sm text-white/40 italic">Not submitted</p>
                </div>
            </div>
        </template>
        </div>
    </section>
</template>

<script setup>
defineProps({
    docTypes: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
})

defineEmits(['download', 'edit'])

function hasFieldValues(submission) {
    const fv = submission?.field_values
    return fv && typeof fv === 'object' && Object.keys(fv).length > 0
}

function getVisibleFields(sub) {
    if (sub?.fields?.length) {
        return sub.fields.filter(f => f.field_type !== 'FILE')
    }
    if (hasFieldValues(sub)) {
        return Object.keys(sub.field_values).map(key => ({
            key,
            label: formatLabel(key),
            field_type: 'TEXTBOX',
        }))
    }
    return []
}

function formatFieldValue(fieldValues, field) {
    const val = fieldValues?.[field.key]
    if (val === undefined || val === null || val === '') return '—'
    if (Array.isArray(val)) return val.join(', ')
    return String(val)
}

function formatLabel(key) {
    return String(key)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
}
</script>

<style scoped>

.status-green { border: 1px solid rgba(34, 197, 94, 0.7); background: rgba(34, 197, 94, 0.18); color: #bbf7d0; }
.status-amber { border: 1px solid rgba(245, 158, 11, 0.7); background: rgba(245, 158, 11, 0.18); color: #fde68a; }
.status-red { border: 1px solid rgba(244, 63, 94, 0.7); background: rgba(244, 63, 94, 0.18); color: #fecdd3; }

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.card {
    padding: 18px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    min-width: 0;
}

.hdr-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    margin-bottom: 12px;
}

.hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    margin: 0;
}

.ic { width: 16px; height: 16px; opacity: 0.85; }

.edit-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.2s ease;
}

.edit-btn:hover {
    color: #4aff7a;
    background: rgba(74, 255, 122, 0.12);
}

.doc-type-block {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.03);
}

.doc-type-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.doc-type-name {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
}

.doc-fields {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.field-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.field-row .label {
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
}

.field-row .value {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
}

.file-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 4px;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
}

.lnk-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #7dd3fc;
    font-size: 12px;
    white-space: nowrap;
}
.lnk-btn:hover { text-decoration: underline; text-underline-offset: 2px; }

.not-submitted {
    padding: 10px 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 0;
}
</style>
