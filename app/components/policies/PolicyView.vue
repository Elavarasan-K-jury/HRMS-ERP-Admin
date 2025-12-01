<template>
    <UiModal v-model="visible" title="Attendance Policy Details" size="lg">
        <template #default>
            <div class="space-y-6 text-white/90 animate-fade-in">

                <!-- Title -->
                <div>
                    <h2 class="text-2xl font-bold tracking-wide flex items-center gap-2">
                        <Icon name="lucide:badge-check" class="w-6 h-6 text-green-400" />
                        {{ policy?.name || 'Attendance Policy' }}
                    </h2>
                    <p class="text-white/50 text-sm mt-1">
                        Policy metadata & configuration details
                    </p>
                </div>

                <!-- GRID -->
                <div class="grid grid-cols-2 gap-4">

                    <!-- Card -->
                    <PolicyItem label="Grace Minutes" icon="lucide:clock-4">
                        {{ policy?.grace_minutes ?? '—' }}
                    </PolicyItem>

                    <PolicyItem label="Half Day Minutes" icon="lucide:sun">
                        {{ policy?.half_day_minutes ?? '—' }}
                    </PolicyItem>

                    <PolicyItem label="Full Day Minutes" icon="lucide:sunrise">
                        {{ policy?.full_day_minutes ?? '—' }}
                    </PolicyItem>

                    <PolicyItem label="Overtime Allowed" icon="lucide:timer-reset">
                        <span :class="policy?.overtime_allowed ? 'text-green-400' : 'text-red-400'">
                            {{ policy?.overtime_allowed ? 'Yes' : 'No' }}
                        </span>
                    </PolicyItem>

                    <PolicyItem label="Geo Check-in" icon="lucide:map-pin">
                        <span :class="policy?.allow_geo_checkin ? 'text-green-400' : 'text-red-400'">
                            {{ policy?.allow_geo_checkin ? 'Allowed' : 'Not Allowed' }}
                        </span>
                    </PolicyItem>

                    <PolicyItem label="Check-in Buffer" icon="lucide:corner-down-left">
                        {{ policy?.checkin_buffer_min ?? 0 }} min
                    </PolicyItem>

                    <PolicyItem label="Check-out Buffer" icon="lucide:corner-down-right">
                        {{ policy?.checkout_buffer_min ?? 0 }} min
                    </PolicyItem>

                    <PolicyItem label="Auto Mark Absent" icon="lucide:alert-circle">
                        <span :class="policy?.auto_mark_absent ? 'text-red-400' : 'text-green-400'">
                            {{ policy?.auto_mark_absent ? 'Enabled' : 'Disabled' }}
                        </span>
                    </PolicyItem>

                    <PolicyItem label="Rounding Strategy" icon="lucide:layers">
                        <span class="capitalize">{{ policy?.rounding_strategy || 'basic' }}</span>
                    </PolicyItem>

                    <PolicyItem label="Min Overtime Minutes" icon="lucide:hourglass">
                        {{ policy?.min_overtime_minutes ?? 0 }} min
                    </PolicyItem>

                </div>
            </div>
        </template>

        <template #footer>
            <UiButton @click="visible = false" color="#4aff7a" text="Close" prepend-icon="lucide:check" />
        </template>
    </UiModal>
</template>

<script setup>
import { computed } from 'vue'
import PolicyItem from './item.vue'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    policy: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
</script>
