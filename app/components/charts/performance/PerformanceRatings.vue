<template>
    <ChartCard title="Employee Performance Ratings" type="bar" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Employees', data: [5, 10, 20, 40, 25] }]
const options = {
    colors: ['#392651'],
    xaxis: { categories: ['1★', '2★', '3★', '4★', '5★'], labels: { style: { colors: '#ccc' } } },
    theme: { mode: 'dark' },
};
</script>
