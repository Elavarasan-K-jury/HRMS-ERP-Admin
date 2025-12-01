<template>
    <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-2 col-span-2">
            <label class="text-md text-white/80">Policy Name:</label>
            <FormInput color="#fff" v-model="name" placeholder="Enter policy name" />
        </div>

        <div class="col-span-2 grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-2">
                <label class="text-md text-white/80">Grace Minutes:</label>
                <FormInput color="#fff" v-model="grace_minutes" placeholder="Grace Minutes" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="text-md text-white/80">Min Overtime Minutes:</label>
                <FormInput color="#fff" v-model="min_overtime_minutes" placeholder="Min Overtime Minutes" />
            </div>
        </div>

        <div class="col-span-2 grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-2">
                <label class="text-md text-white/80">Half Day (Minutes):</label>
                <FormInput color="#fff" v-model="half_day_minutes" label="Half Day (Minutes)" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="text-md text-white/80">Full Day (Minutes):</label>
                <FormInput color="#fff" v-model="full_day_minutes" label="Full Day (Minutes)" />
            </div>
        </div>

        <div class="col-span-2 grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-2">
                <label class="text-md text-white/80">Check-in Buffer (Minutes):</label>
                <FormInput color="#fff" v-model="checkin_buffer_min" label="Check-in Buffer (Minutes)" />
            </div>
            <div class="flex flex-col gap-2">
                <label class="text-md text-white/80">Check-out Buffer (Minutes):</label>
                <FormInput color="#fff" v-model="checkout_buffer_min" label="Check-out Buffer (Minutes)" />
            </div>
        </div>

        <div class="flex flex-col gap-2 col-span-2">
            <label class="text-md text-white/80">Rounding Strategy:</label>
            <FormSelect color="#fff" v-model="rounding_strategy" :options="[
                { label: 'Basic', value: 'basic' },
                { label: 'Nearest 15', value: 'nearest_15' },
                { label: 'Nearest 30', value: 'nearest_30' }
            ]" placeholder="Rounding Strategy" />
        </div>

        <div class="col-span-2 grid grid-cols-2 gap-3 mt-3">
            <div class="flex justify-between items-center">
                <label>Allow Geo Check-in</label>
                <UiSwitch v-model="allow_geo_checkin" />
            </div>
            <div class="flex justify-between items-center">
                <label>Allow Outside Geo</label>
                <UiSwitch v-model="allow_outside_geo" />
            </div>
            <div class="flex justify-between items-center">
                <label>Auto Mark Absent</label>
                <UiSwitch v-model="auto_mark_absent" />
            </div>
            <div class="flex justify-between items-center">
                <label>Overtime Allowed</label>
                <UiSwitch v-model="overtime_allowed" />
            </div>
        </div>

    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAttendancePolicyStore } from '@/stores/attendancePolicy.store'

const store = useAttendancePolicyStore()

const {
    name,
    grace_minutes,
    half_day_minutes,
    full_day_minutes,
    allow_geo_checkin,
    allow_outside_geo,
    auto_mark_absent,
    checkin_buffer_min,
    checkout_buffer_min,
    rounding_strategy,
    overtime_allowed,
    min_overtime_minutes
} = storeToRefs(store);
</script>
