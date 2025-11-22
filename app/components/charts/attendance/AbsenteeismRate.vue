<template>
    <ChartCard title="Absenteeism Rate" type="line" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Absenteeism %', data: [3.1, 2.9, 3.3, 3.5, 3.0, 3.2, 2.8] }]
const options = {
    colors: ['#9c3c1b'],
    stroke: { width: 3, curve: 'smooth' },
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], labels: { style: { colors: '#ccc' } } },
    theme: { mode: 'dark' },
};
</script>
