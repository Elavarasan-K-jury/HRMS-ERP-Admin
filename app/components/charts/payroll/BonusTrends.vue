<template>
    <ChartCard title="Bonus & Incentive Trends" type="line" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Bonuses', data: [10, 15, 20, 25, 18, 30, 35] }]
const options = {
    colors: ['#1b6594'],
    stroke: { width: 3, curve: 'smooth' },
    chart: { toolbar: { show: false } },
    theme: { mode: 'dark' },
};
</script>
