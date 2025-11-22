<template>
    <ChartCard title="Total Payroll Expense (Monthly)" type="area" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Expense (Lakh ₹)', data: [40, 45, 47, 50, 48, 52, 56] }]
const options = {
    colors: ['#fff'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.7, opacityTo: 0.1 } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], labels: { style: { colors: '#ccc' } } },
    chart: { toolbar: { show: false }, background: 'transparent' },
    theme: { mode: 'dark' },
};
</script>
