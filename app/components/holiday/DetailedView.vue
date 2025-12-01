<template>
    <UiModal :model-value="modelValue" title="Holiday Details" size="md" @update:model-value="updateModel">
        <template #default>
            <div v-if="holiday" class="space-y-4 text-sm text-white/90">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-white">
                            {{ holiday.name }}
                        </h3>
                        <p class="text-xs text-white/60">
                            {{ formatDate(holiday.date) }} ·
                            <span class="uppercase text-[11px] font-medium">
                                {{ holiday.type }}
                            </span>
                        </p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-[10px] font-semibold" :class="getTypeBadge(holiday.type)">
                        {{ holiday.type }}
                    </span>
                </div>

                <div class="border-t border-white/10 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <div class="label">Region</div>
                        <div>{{ holiday.region || '—' }}</div>
                    </div>

                    <div class="space-y-1">
                        <div class="label">Policy</div>
                        <div class="font-medium">
                            {{ holiday.policy?.name || holiday.policy_name || '—' }}
                        </div>
                        <div class="text-xs text-white/60">
                            {{ holiday.policy?.region || holiday.policy_region || '' }}
                        </div>
                    </div>

                    <div class="space-y-1">
                        <div class="label">Created At</div>
                        <div>{{ formatDateTime(holiday.created_at) }}</div>
                    </div>

                    <div class="space-y-1">
                        <div class="label">Updated At</div>
                        <div>{{ formatDateTime(holiday.updated_at) }}</div>
                    </div>
                </div>
            </div>

            <div v-else class="text-sm text-white/70">
                No holiday selected.
            </div>
        </template>

        <template #footer>
            <UiButton color="#fff" text="Close" prepend-icon="ion:close-circle" @click="updateModel(false)" />
        </template>
    </UiModal>
</template>

<script setup>
const props = defineProps({
    modelValue: { type: Boolean, default: false },
    holiday: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue'])

const updateModel = (val) => {
    emit('update:modelValue', val)
}

const getTypeBadge = (type) => {
    switch (type) {
        case 'PUBLIC':
            return 'bg-emerald-500/20 text-emerald-300'
        case 'RESTRICTED':
            return 'bg-amber-500/20 text-amber-300'
        case 'OPTIONAL':
            return 'bg-sky-500/20 text-sky-300'
        case 'WEEK_OFF':
            return 'bg-purple-500/20 text-purple-300'
        case 'COMPANY_EVENT':
            return 'bg-pink-500/20 text-pink-300'
        default:
            return 'bg-white/20 text-white'
    }
}

function formatDate(date) {
    if (!date) return '—'
    try {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    } catch {
        return date
    }
}

function formatDateTime(date) {
    if (!date) return '—'
    try {
        return new Date(date).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
    } catch {
        return date
    }
}
</script>

<style scoped>
.label {
    @apply text-xs font-semibold text-white/60 uppercase tracking-wide;
}
</style>
