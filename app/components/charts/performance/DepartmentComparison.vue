<template>
    <ChartCard title="Department Performance Comparison" type="bar" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Avg Rating', data: [3.9, 4.1, 4.3, 3.7, 4.0] }]
const options = {
    colors: ['#1b6594'],
    xaxis: { categories: ['HR', 'Tech', 'Finance', 'Ops', 'Marketing'], labels: { style: { colors: '#ccc' } } },
    theme: { mode: 'dark' },
};
</script>
