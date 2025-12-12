<template>
    <div
        class="rounded-lg border border-white/10 bg-white/4 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,.3)] p-5 flex flex-col gap-4 w-full">

        <!-- Title -->
        <h2 class="text-lg font-semibold text-white tracking-wide">Upcoming Holiday</h2>

        <!-- No Data -->
        <div v-if="!holiday" class="text-white/50 text-sm py-6 text-center">
            No upcoming holiday
        </div>

        <!-- Holiday Info -->
        <div v-else class="flex items-center justify-between">
            <!-- Left: Avatar + Info -->
            <div class="flex items-center gap-3">
                <!-- Avatar Circle -->
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                            flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    {{ holidayInitial }}
                </div>

                <!-- Holiday name + date -->
                <div class="flex flex-col">
                    <span class="text-white font-medium">{{ holiday.name }}</span>
                    <span class="text-xs text-white/60">{{ formattedDate }}</span>
                </div>
            </div>

            <!-- Right: View Button -->
            <button
                class="px-4 py-1.5 text-sm rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all bg-white/5">
                VIEW
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useHolidayStore } from '../../stores/holiday.store'

const store = useHolidayStore()

// Single upcoming holiday
const holiday = computed(() => store.upcomingHoliday)

// First letters for avatar
const holidayInitial = computed(() => {
    if (!holiday.value) return '?'
    const name = holiday.value.name || 'H'
    return name.substring(0, 2).toUpperCase()
})

// Format date: "28 November"
const formattedDate = computed(() => {
    if (!holiday.value?.date) return ''
    return new Date(holiday.value.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
    })
});

onMounted(async () => {
    await store.fetchAllHolidays()
    await store.fetchUpcomingHoliday()
});

</script>

<style scoped>
/* smooth fade */
button {
    backdrop-filter: blur(4px);
}
</style>
