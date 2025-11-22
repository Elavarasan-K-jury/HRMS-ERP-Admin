<template>
    <ChartCard title="Overtime Hours by Department" type="bar" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Hours', data: [20, 50, 15, 30, 10] }]
const options = {
    colors: ['#a27a65'],
    xaxis: { categories: ['HR', 'Tech', 'Finance', 'Marketing', 'Ops'], labels: { style: { colors: '#ccc' } } },
    grid: { borderColor: 'rgba(255,255,255,0.1)' },
    theme: { mode: 'dark' },
};
</script>
