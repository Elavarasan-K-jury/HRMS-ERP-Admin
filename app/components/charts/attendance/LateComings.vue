<template>
    <ChartCard title="Late Comings / Early Leaves">
        <table class="w-full text-sm text-white/80 border-collapse">
            <thead>
                <tr class="text-white/60 border-b border-white/10">
                    <th class="text-left py-2">Date</th>
                    <th class="text-left py-2">Late Arrivals</th>
                    <th class="text-left py-2">Early Leaves</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="d in data" :key="d.date" class="hover:bg-white/10">
                    <td class="py-2">{{ d.date }}</td>
                    <td class="py-2">{{ d.late }}</td>
                    <td class="py-2">{{ d.early }}</td>
                </tr>
            </tbody>
        </table>
    </ChartCard>
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const data = [
    { date: '2025-10-21', late: 4, early: 2 },
    { date: '2025-10-22', late: 3, early: 1 },
    { date: '2025-10-23', late: 6, early: 3 },
    { date: '2025-10-24', late: 2, early: 0 },
];
</script>
