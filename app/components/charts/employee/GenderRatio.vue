<template>
    <ChartCard title="Gender Ratio" type="donut" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [60, 35, 5]
const options = {
    labels: ['Male', 'Female', 'Other'],
    colors: ['#1b6594', '#392651', '#9c3c1b'],
    legend: { position: 'bottom', labels: { colors: '#fff' } },
    dataLabels: { enabled: false },
    chart: { toolbar: { show: false }, background: 'transparent' },
    theme: { mode: 'dark' },
};
</script>
