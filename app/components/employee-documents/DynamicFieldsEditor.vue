<template>
    <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-white/85">Form Fields</p>
            <UiButton @click="addField" color="#4aff7a" text="+ Add Field" size="sm" />
        </div>

        <div v-if="!fields.length" class="rounded-lg border border-dashed border-white/15 py-8 flex flex-col items-center gap-2 text-white/40">
            <Icon name="ion:list-outline" class="w-7 h-7 opacity-50" />
            <p class="text-xs">No form fields yet. Add a field to collect details for this document.</p>
        </div>

        <div v-else class="overflow-x-auto rounded-lg border border-white/10">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/5 border-b border-white/10">
                    <tr>
                        <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Field Name</th>
                        <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Field Type</th>
                        <th class="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-white/50">Values</th>
                        <th class="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-white/50">Mandatory</th>
                        <th class="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-white/50">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(f, idx) in fields" :key="f._localId" class="border-b border-white/5 align-top">
                        <td class="px-2 py-2 min-w-[160px]">
                            <FormInput v-model="f.label" placeholder="Field name" color="#4aff7a" size="sm" rounded="lg" />
                        </td>
                        <td class="px-2 py-2 min-w-[150px]">
                            <FormSelect v-model="f.field_type" :options="fieldTypeOptions" color="#4aff7a" size="sm" rounded="lg" />
                        </td>
                        <td class="px-2 py-2 min-w-[200px]">
                            <template v-if="hasOptions(f.field_type)">
                                <div class="flex flex-col gap-1.5">
                                    <template v-for="(opt, oi) in f.options" :key="oi">
                                        <div class="flex items-center gap-1.5">
                                            <FormInput v-model="f.options[oi]" :placeholder="f.field_type === 'MULTI_SELECT' ? 'Multi-select option' : 'Option'" color="#4aff7a" size="sm" rounded="lg" class="flex-1" />
                                            <button type="button" class="text-white/40 hover:text-rose-300 p-1 shrink-0" @click="removeOption(f, oi)" title="Remove option">
                                                <Icon name="lucide:x" class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </template>
                                    <button type="button" class="text-xs text-sky-300 hover:text-sky-200 text-left" @click="addOption(f)">+ Add option</button>
                                </div>
                            </template>
                            <span v-else class="text-xs text-white/40">—</span>
                        </td>
                        <td class="px-2 py-2 text-center">
                            <input type="checkbox" v-model="f.is_mandatory" class="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500" />
                        </td>
                        <td class="px-2 py-2 text-right">
                            <button type="button" class="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-300" title="Remove field" @click="removeField(idx)">
                                <Icon name="lucide:trash-2" class="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    fields: { type: Array, default: () => [] },
})

const fieldTypeOptions = [
    { value: 'TEXTBOX', label: 'Textbox' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'DATE', label: 'Date' },
    { value: 'TEXTAREA', label: 'Textarea' },
    { value: 'DROPDOWN', label: 'Dropdown (Single Select)' },
    { value: 'MULTI_SELECT', label: 'Multi Select' },
    { value: 'FILE', label: 'File' },
]

const OPTION_TYPES = ['DROPDOWN', 'MULTI_SELECT']
function hasOptions(type) { return OPTION_TYPES.includes(type) }

let localCounter = Date.now()
function newLocalId() { return 'lf_' + (localCounter++) }

function addField() {
    props.fields.push({
        _localId: newLocalId(),
        id: '',
        label: '',
        key: '',
        field_type: 'TEXTBOX',
        options: [],
        is_mandatory: false,
        display_order: props.fields.length,
    })
}

function addOption(f) { f.options.push('') }
function removeOption(f, oi) { f.options.splice(oi, 1) }
function removeField(idx) { props.fields.splice(idx, 1); recalcOrder() }

function recalcOrder() {
    props.fields.forEach((f, i) => { f.display_order = i })
}
</script>
