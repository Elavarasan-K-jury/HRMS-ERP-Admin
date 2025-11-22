<template>
    <ChartCard title="Department-wise Headcount" type="bar" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'

const series = [{ name: 'Employees', data: [10, 120, 40, 30, 50] }]
const options = {
    chart: { toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
    colors: ['#8e8e8e'],
    xaxis: {
        categories: ['HR', 'Tech', 'Finance', 'Marketing', 'Ops'],
        labels: { style: { colors: '#ccc' } },
    },
    grid: { borderColor: 'rgba(255,255,255,0.1)' },
    theme: { mode: 'dark' },
};
</script>
