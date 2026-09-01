<template>
    <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Left column -->
            <div class="space-y-4">
                <LegalEntitiesLeField label="Full Name" required>
                    <LegalEntitiesLeTextInput v-model="form.full_name" placeholder="Signatory's full name" />
                </LegalEntitiesLeField>
                <LegalEntitiesLeField label="Email" required>
                    <LegalEntitiesLeTextInput v-model="form.email" type="email" placeholder="signatory@company.com" />
                </LegalEntitiesLeField>
                <LegalEntitiesLeField label="Address Line 1">
                    <LegalEntitiesLeTextInput v-model="form.address1" placeholder="Street address" />
                </LegalEntitiesLeField>
                <LegalEntitiesLeField label="City">
                    <LegalEntitiesLeTextInput v-model="form.city" placeholder="City" />
                </LegalEntitiesLeField>
                <LegalEntitiesLeField label="Zip Code">
                    <LegalEntitiesLeTextInput v-model="form.zip" placeholder="e.g. 560038" />
                </LegalEntitiesLeField>
            </div>

            <!-- Right column -->
            <div class="space-y-4">
                <LegalEntitiesLeField label="Designation" required>
                    <LegalEntitiesLeTextInput v-model="form.designation" placeholder="e.g. Managing Director" />
                </LegalEntitiesLeField>
                <LegalEntitiesLeField label="Signatory's Father Name" required>
                    <LegalEntitiesLeTextInput v-model="form.father_name" placeholder="Father's name" />
                </LegalEntitiesLeField>
                <LegalEntitiesLeField label="Address Line 2">
                    <LegalEntitiesLeTextInput v-model="form.address2" placeholder="Area / locality" />
                </LegalEntitiesLeField>
                <LegalEntitiesLeField label="State">
                    <LegalEntitiesLeTextInput v-model="form.state" placeholder="State" />
                </LegalEntitiesLeField>
                <LegalEntitiesLeField label="Country">
                    <LegalEntitiesLeSelect v-model="form.country" :options="COUNTRIES" placeholder="Select country" />
                </LegalEntitiesLeField>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { COUNTRIES } from '~/constants/legalEntities'

const props = defineProps({
    initial: { type: Object, default: null },
})

const emit = defineEmits(['submit'])

const form = reactive({
    full_name: '',
    email: '',
    designation: '',
    father_name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
})

watch(() => props.initial, (init) => {
    if (init) {
        Object.assign(form, {
            full_name: init.full_name || '',
            email: init.email || '',
            designation: init.designation || '',
            father_name: init.father_name || '',
            address1: init.address1 || '',
            address2: init.address2 || '',
            city: init.city || '',
            state: init.state || '',
            zip: init.zip || '',
            country: init.country || '',
        })
    }
}, { immediate: true })

const requiredFields = computed(() => {
    const rules = {
        full_name: 'Full Name',
        email: 'Email',
        designation: 'Designation',
        father_name: "Signatory's Father Name",
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