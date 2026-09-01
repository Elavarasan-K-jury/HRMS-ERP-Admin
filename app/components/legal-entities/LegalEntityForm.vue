<template>
    <div class="space-y-4">
        <!-- Logo -->
        <div class="flex items-center gap-4">
            <div
                class="w-20 h-20 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img v-if="logoPreview" :src="resolveMediaUrl(logoPreview)" class="w-full h-full object-cover" alt="entity logo" />
                <Icon v-else name="ion:image-outline" class="text-3xl text-white/40" />
            </div>
            <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-white/80">Add Logo</label>
                <div class="flex items-center gap-2">
                    <label class="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/20 transition-colors">
                        <Icon name="ion:cloud-upload-outline" class="text-base" />
                        Upload Logo
                        <input type="file" accept="image/*" class="hidden" @change="onLogoChange" />
                    </label>
                    <button v-if="logoPreview" type="button" @click="clearLogo"
                        class="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/15 transition-colors">
                        <Icon name="ion:close-outline" class="text-base" /> Remove
                    </button>
                </div>
                <p class="text-[11px] text-white/45">JPG / PNG, recommended 200×200px.</p>
            </div>
        </div>

        <!-- Country -->
        <LegalEntitiesLeField label="Country">
            <LegalEntitiesLeSelect v-model="form.country" :options="COUNTRIES" placeholder="Select country" />
        </LegalEntitiesLeField>

        <!-- Entity Name -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LegalEntitiesLeField label="Entity Name" required>
                <LegalEntitiesLeTextInput v-model="form.name" placeholder="e.g. JURYsoft GLOBAL PRIVATE LIMITED" />
            </LegalEntitiesLeField>
            <LegalEntitiesLeField label="Legal Name of the Company" required>
                <LegalEntitiesLeTextInput v-model="form.legal_name" placeholder="Legal name as per incorporation" />
            </LegalEntitiesLeField>
        </div>

        <!-- CIN / Incorporation -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LegalEntitiesLeField label="Company Identification Number" required>
                <LegalEntitiesLeTextInput v-model="form.cin" placeholder="e.g. U72900KA2021PTC123456" />
            </LegalEntitiesLeField>
            <LegalEntitiesLeField label="Date of Incorporation" required>
                <LegalEntitiesLeDateInput v-model="form.incorporation_date" />
            </LegalEntitiesLeField>
        </div>

        <!-- Business type / Sector -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LegalEntitiesLeField label="Type of Business" required>
                <LegalEntitiesLeSelect v-model="form.business_type" :options="BUSINESS_TYPES" placeholder="Select type" />
            </LegalEntitiesLeField>
            <LegalEntitiesLeField label="Sector" required>
                <LegalEntitiesLeSelect v-model="form.sector" :options="SECTORS" placeholder="Select sector" />
            </LegalEntitiesLeField>
        </div>

        <!-- Nature of business -->
        <LegalEntitiesLeField label="Nature of Business" required>
            <LegalEntitiesLeSelect v-model="form.nature_of_business" :options="NATURE_OF_BUSINESS" placeholder="Select nature of business" />
        </LegalEntitiesLeField>

        <!-- Address -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LegalEntitiesLeField label="Address Line 1" required>
                <LegalEntitiesLeTextInput v-model="form.address1" placeholder="Street address, plot no." />
            </LegalEntitiesLeField>
            <LegalEntitiesLeField label="Address Line 2">
                <LegalEntitiesLeTextInput v-model="form.address2" placeholder="Area / locality" />
            </LegalEntitiesLeField>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LegalEntitiesLeField label="City" required>
                <LegalEntitiesLeTextInput v-model="form.city" placeholder="City" />
            </LegalEntitiesLeField>
            <LegalEntitiesLeField label="State" required>
                <LegalEntitiesLeTextInput v-model="form.state" placeholder="State" />
            </LegalEntitiesLeField>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LegalEntitiesLeField label="Zip Code" required>
                <LegalEntitiesLeTextInput v-model="form.zip" placeholder="e.g. 560098" />
            </LegalEntitiesLeField>
            <LegalEntitiesLeField label="Currency">
                <LegalEntitiesLeSelect v-model="form.currency" :options="CURRENCIES" placeholder="Select currency" />
            </LegalEntitiesLeField>
        </div>

        <!-- Financial year -->
        <LegalEntitiesLeField label="Financial Year">
            <LegalEntitiesLeSelect v-model="form.financial_year" :options="FINANCIAL_YEARS" placeholder="Select financial year" />
        </LegalEntitiesLeField>
    </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import {
    COUNTRIES,
    BUSINESS_TYPES,
    SECTORS,
    NATURE_OF_BUSINESS,
    CURRENCIES,
    FINANCIAL_YEARS,
} from '~/constants/legalEntities'
import { resolveMediaUrl } from '~/utils/media'

const props = defineProps({
    initial: { type: Object, default: null },
})

const emit = defineEmits(['submit'])

const logoPreview = ref(null)

const form = reactive({
    logo: null,
    country: '',
    name: '',
    legal_name: '',
    cin: '',
    incorporation_date: '',
    business_type: '',
    sector: '',
    nature_of_business: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    currency: '',
    financial_year: '',
})

watch(() => props.initial, (init) => {
    if (init) {
        Object.assign(form, {
            logo: init.logo || null,
            country: init.country || '',
            name: init.name || '',
            legal_name: init.legal_name || '',
            cin: init.cin || '',
            incorporation_date: init.incorporation_date || '',
            business_type: init.business_type || '',
            sector: init.sector || '',
            nature_of_business: init.nature_of_business || '',
            address1: init.address1 || '',
            address2: init.address2 || '',
            city: init.city || '',
            state: init.state || '',
            zip: init.zip || '',
            currency: init.currency || '',
            financial_year: init.financial_year || '',
        })
        logoPreview.value = init.logo_file_id
            ? `/file/${init.logo_file_id}`
            : (init.logo || null)
    }
}, { immediate: true })

const requiredFields = computed(() => {
    const rules = {
        name: 'Entity Name',
        legal_name: 'Legal Name of the Company',
        cin: 'Company Identification Number',
        incorporation_date: 'Date of Incorporation',
        business_type: 'Type of Business',
        sector: 'Sector',
        nature_of_business: 'Nature of Business',
        address1: 'Address Line 1',
        city: 'City',
        state: 'State',
        zip: 'Zip Code',
    }
    const missing = []
    for (const [key, label] of Object.entries(rules)) {
        if (!String(form[key] || '').trim()) missing.push(label)
    }
    return missing
})

const onLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    logoPreview.value = URL.createObjectURL(file)
    form.logo = file
}

const clearLogo = () => {
    logoPreview.value = null
    form.logo = null
}

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