<template>
    <ChartCard title="Salary Distribution by Grade">
        <table class="w-full text-sm text-white/80">
            <thead class="border-b border-white/10 text-white/60">
                <tr>
                    <th class="text-left py-2">Grade</th>
                    <th class="text-left py-2">Avg Salary (₹)</th>
                    <th class="text-left py-2">Employees</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="g in grades" :key="g.grade" class="hover:bg-white/10">
                    <td class="py-2">{{ g.grade }}</td>
                    <td class="py-2">{{ g.salary.toLocaleString() }}</td>
                    <td class="py-2">{{ g.count }}</td>
                </tr>
            </tbody>
        </table>
    </ChartCard>
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const grades = [
    { grade: 'A', salary: 120000, count: 10 },
    { grade: 'B', salary: 90000, count: 40 },
    { grade: 'C', salary: 65000, count: 80 },
    { grade: 'D', salary: 40000, count: 50 },
];
</script>
