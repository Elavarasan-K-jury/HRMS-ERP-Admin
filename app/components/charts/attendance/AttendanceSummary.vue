<template>
    <ChartCard title="Monthly Attendance Summary" type="area" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [
    { name: 'Present', data: [20, 22, 21, 23, 19, 21, 20] },
    { name: 'Absent', data: [2, 1, 3, 2, 4, 2, 3] },
]
const options = {
    chart: { toolbar: { show: false }, background: 'transparent' },
    colors: ['#1b6594', '#9c3c1b'],
    dataLabels: { enabled: false },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: '#ccc' } } },
    grid: { borderColor: 'rgba(255,255,255,0.1)' },
    theme: { mode: 'dark' },
};
</script>
