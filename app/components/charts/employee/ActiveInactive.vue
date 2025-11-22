<template>
    <ChartCard title="Active vs Inactive Employees" type="donut" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'

const series = [230, 20]

const options = {
    chart: {
        background: 'transparent',   // ← this is the one that matters
        toolbar: { show: false },
    },
    labels: ['Active', 'Inactive'],
    colors: ['#1b6594', '#9c3c1b'],
    dataLabels: { enabled: false },
    legend: {
        position: 'bottom',
        labels: { colors: '#ffffff' },
    },
    stroke: { width: 1 },
    grid: { show: false },
    tooltip: { theme: 'dark' },
    theme: { mode: 'dark' },       // keep mode; background removed from here
};
</script>
