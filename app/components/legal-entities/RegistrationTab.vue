<template>
    <div class="flex flex-col gap-3 h-full">
        <div class="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mt-6">
            <div>
                <p class="eyebrow">Registration Information</p>
                <h3 class="mt-1 text-lg font-semibold text-white/90">Entity Details</h3>
                <p class="mt-0.5 text-sm text-white/50">Registration and address details of {{ entity?.name || 'this legal entity' }}.</p>
            </div>
            <UiButton size="xs" color="#4aff7a" text="Edit Details" prepend-icon="ion:create-outline"
                @click="$emit('add-entity')" />
        </div>

        <div v-if="!entity" class="py-10 text-center text-sm text-white/50">No legal entity selected.</div>

        <template v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="field in fields" :key="field.label"
                    class="rounded-lg bg-black/20 border border-white/10 px-3 py-2.5">
                    <p class="text-[10px] uppercase tracking-wider text-white/45">{{ field.label }}</p>
                    <p class="mt-1 text-sm text-white/90 break-words">{{ field.value || '—' }}</p>
                </div>
            </div>

            <div class="mt-auto pt-3 text-[11px] text-white/35">
                Entity ID: {{ entity.id }}
            </div>
        </template>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    entity: { type: Object, default: null },
})

defineEmits(['add-entity'])

const formatDate = (date) => {
    if (!date) return ''
    try {
        return new Date(date).toLocaleString('en-IN', { dateStyle: 'medium' })
    } catch {
        return date
    }
}

const fields = computed(() => {
    const e = props.entity
    if (!e) return []
    return [
        { label: 'Entity Name', value: e.name },
        { label: 'Legal Name of the Company', value: e.legal_name },
        { label: 'Company Identification Number', value: e.cin },
        { label: 'Date of Incorporation', value: formatDate(e.incorporation_date) },
        { label: 'Type of Business', value: e.business_type },
        { label: 'Sector', value: e.sector },
        { label: 'Nature of Business', value: e.nature_of_business },
        { label: 'Address Line 1', value: e.address1 },
        { label: 'Address Line 2', value: e.address2 },
        { label: 'City', value: e.city },
        { label: 'State', value: e.state },
        { label: 'Zip Code', value: e.zip },
        { label: 'Currency', value: e.currency },
        { label: 'Financial Year', value: e.financial_year },
    ]
})
</script>

<style scoped>
.eyebrow { @apply text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300/75; }
</style>