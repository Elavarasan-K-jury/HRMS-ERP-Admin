<template>
    <ChartCard title="Compliance Training Completion" type="line" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Completion %', data: [60, 65, 72, 80, 85, 88, 90] }]
const options = {
    colors: ['#1b6594'],
    stroke: { width: 3, curve: 'smooth' },
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], labels: { style: { colors: '#ccc' } } },
    theme: { mode: 'dark' },
};
</script>
