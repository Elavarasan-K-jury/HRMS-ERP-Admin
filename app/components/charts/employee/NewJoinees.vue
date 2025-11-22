<template>
    <ChartCard title="New Joinees (Monthly)" type="area" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'

const series = [{ name: 'Joinees', data: [12, 15, 10, 18, 22, 25, 20, 19, 17, 14, 12, 10] }]

const options = {
    chart: { toolbar: { show: false }, background: 'transparent' },
    colors: ['#fff'],
    fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 0.4, opacityFrom: 0.7, opacityTo: 0.1 },
    },
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: { style: { colors: '#ccc' } },
    },
    theme: { mode: 'dark' },
};
</script>
