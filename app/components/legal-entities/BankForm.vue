<template>
    <div class="space-y-4">
        <!-- Row 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LegalEntitiesLeField label="Bank Name" required>
                <LegalEntitiesLeSelect v-model="form.bank_name" :options="BANKS" placeholder="Select bank" />
            </LegalEntitiesLeField>
            <LegalEntitiesLeField label="Account Number" required>
                <LegalEntitiesLeTextInput v-model="form.account_number" placeholder="Account number" />
            </LegalEntitiesLeField>
        </div>

        <!-- Row 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LegalEntitiesLeField label="IFSC Code" required>
                <LegalEntitiesLeTextInput v-model="form.ifsc_code" placeholder="e.g. HDFC0001234" />
            </LegalEntitiesLeField>
            <LegalEntitiesLeField label="Branch">
                <LegalEntitiesLeTextInput v-model="form.branch" placeholder="Branch name" />
            </LegalEntitiesLeField>
        </div>

        <!-- Row 3 -->
        <LegalEntitiesLeField label="Establishment ID / Corporate ID (with bank)">
            <LegalEntitiesLeTextInput v-model="form.establishment_id" placeholder="Establishment / corporate ID issued by the bank" />
        </LegalEntitiesLeField>
    </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { BANKS } from '~/constants/legalEntities'

const props = defineProps({
    initial: { type: Object, default: null },
})

const emit = defineEmits(['submit'])

const form = reactive({
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    branch: '',
    establishment_id: '',
})

watch(() => props.initial, (init) => {
    if (init) {
        Object.assign(form, {
            bank_name: init.bank_name || '',
            account_number: init.account_number || '',
            ifsc_code: init.ifsc_code || '',
            branch: init.branch || '',
            establishment_id: init.establishment_id || '',
        })
    }
}, { immediate: true })

const requiredFields = computed(() => {
    const rules = {
        bank_name: 'Bank Name',
        account_number: 'Account Number',
        ifsc_code: 'IFSC Code',
    }
    const missing = []
    for (const [key, label] of Object.entries(rules)) {
        if (!String(form[key] || '').trim()) missing.push(label)
    }
    return missing
})

const submit = () => {
    if (requiredFields.value.length) {
        useToast().error({
            title: 'Missing fields',
            message: `Please fill: ${requiredFields.value.join(', ')}`,
            timeout: 3000,
        })
        return
    }
    emit('submit', { ...form })
}

defineExpose({ submit })
</script>