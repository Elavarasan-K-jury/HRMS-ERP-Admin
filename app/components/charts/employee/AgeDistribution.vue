<template>
    <ChartCard title="Age Distribution" type="bar" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Employees', data: [20, 60, 90, 40, 10] }]
const options = {
    colors: ['#a27a65'],
    xaxis: { categories: ['18–25', '26–30', '31–35', '36–45', '46+'], labels: { style: { colors: '#ccc' } } },
    grid: { borderColor: 'rgba(255,255,255,0.1)' },
    theme: { mode: 'dark' },
};
</script>
