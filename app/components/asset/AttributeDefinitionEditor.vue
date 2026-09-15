<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
        Custom Attributes
      </h4>
      <UButton
        size="xs"
        variant="outline"
        icon="i-lucide-plus"
        @click="addField"
      >
        Add Field
      </UButton>
    </div>

    <div v-if="fields.length === 0" class="text-center py-6 text-slate-400 text-sm">
      No custom attributes defined. Click "Add Field" to create one.
    </div>

    <div
      v-for="(field, index) in fields"
      :key="field._key"
      class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 bg-slate-50 dark:bg-slate-800/50"
    >
      <div class="flex items-start gap-3">
        <div class="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Label *</label>
            <UInput
              v-model="field.label"
              placeholder="e.g. RAM Size"
              @update:model-value="onLabelChange(index)"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Key</label>
            <UInput
              v-model="field.key"
              placeholder="auto-generated"
              :disabled="field.autoKey"
              :class="{ 'opacity-60': field.autoKey }"
            />
          </div>
        </div>
        <UButton
          icon="i-lucide-trash-2"
          color="red"
          variant="ghost"
          size="xs"
          class="mt-5"
          @click="removeField(index)"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Field Type *</label>
          <USelect
            v-model="field.fieldType"
            :items="fieldTypeOptions"
            placeholder="Select type"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Display Order</label>
          <UInput
            v-model.number="field.displayOrder"
            type="number"
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <div v-if="field.fieldType === 'DROPDOWN' || field.fieldType === 'MULTI_SELECT'">
        <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Options (comma-separated)
        </label>
        <UInput
          v-model="field.optionsRaw"
          placeholder="e.g. 8GB, 16GB, 32GB, 64GB"
        />
      </div>

      <div class="flex items-center gap-4">
        <UCheckbox v-model="field.isMandatory" label="Required" />
        <UCheckbox v-model="field.isUnique" label="Unique" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  definitions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'sync'])

const fieldTypeOptions = [
  { label: 'Text', value: 'TEXTBOX' },
  { label: 'Number', value: 'NUMBER' },
  { label: 'Date', value: 'DATE' },
  { label: 'Dropdown', value: 'DROPDOWN' },
  { label: 'Textarea', value: 'TEXTAREA' },
  { label: 'Multi-Select', value: 'MULTI_SELECT' },
]

let keyCounter = 0

const fields = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function makeKey(label) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function addField() {
  keyCounter++
  const newFields = [...fields.value]
  newFields.push({
    _key: `new_${keyCounter}_${Date.now()}`,
    id: '',
    label: '',
    key: '',
    fieldType: 'TEXTBOX',
    optionsRaw: '',
    isMandatory: false,
    isUnique: false,
    displayOrder: newFields.length,
    autoKey: true,
  })
  emit('update:modelValue', newFields)
}

function removeField(index) {
  const newFields = [...fields.value]
  newFields.splice(index, 1)
  emit('update:modelValue', newFields)
}

function onLabelChange(index) {
  const field = fields.value[index]
  if (field.autoKey) {
    const newFields = [...fields.value]
    newFields[index] = { ...newFields[index], key: makeKey(newFields[index].label) }
    emit('update:modelValue', newFields)
  }
}

function toDefinitions(fieldsList) {
  return fieldsList.map((f, i) => ({
    id: f.id || '',
    label: f.label,
    key: f.key || makeKey(f.label),
    field_type: f.fieldType,
    options: (f.fieldType === 'DROPDOWN' || f.fieldType === 'MULTI_SELECT') && f.optionsRaw
      ? JSON.stringify(f.optionsRaw.split(',').map(o => o.trim()).filter(Boolean))
      : '',
    is_mandatory: f.isMandatory,
    is_unique: f.isUnique,
    display_order: f.displayOrder !== undefined ? f.displayOrder : i,
  }))
}

function fromDefinitions(defs) {
  return defs.map((d, i) => {
    let optionsRaw = ''
    if (d.options) {
      try {
        const parsed = JSON.parse(d.options)
        if (Array.isArray(parsed)) optionsRaw = parsed.join(', ')
      } catch { /* ignore */ }
    }
    return {
      _key: d.id || `existing_${i}_${Date.now()}`,
      id: d.id || '',
      label: d.label || '',
      key: d.key || '',
      fieldType: d.field_type || 'TEXTBOX',
      optionsRaw,
      isMandatory: d.is_mandatory || false,
      isUnique: d.is_unique || false,
      displayOrder: d.display_order || 0,
      autoKey: false,
    }
  })
}

watch(
  () => props.definitions,
  (newDefs) => {
    if (newDefs && newDefs.length > 0 && fields.value.length === 0) {
      emit('update:modelValue', fromDefinitions(newDefs))
    }
  },
  { immediate: true }
)

defineExpose({ toDefinitions, fromDefinitions })
</script>
