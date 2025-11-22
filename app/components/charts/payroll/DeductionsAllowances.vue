<template>
    <ChartCard title="Deductions & Allowances" type="bar" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [
    { name: 'Allowances', data: [40, 50, 60, 70] },
    { name: 'Deductions', data: [10, 12, 15, 20] },
]
const options = {
    colors: ['#a27a65', '#9c3c1b'],
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr'], labels: { style: { colors: '#ccc' } } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false } },
    theme: { mode: 'dark' },
};
</script>
