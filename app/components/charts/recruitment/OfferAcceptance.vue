<template>
    <ChartCard title="Offer Acceptance Rate" type="radialBar" :series="[78]" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const options = {
    plotOptions: {
        radialBar: {
            hollow: { size: '70%' },
            dataLabels: {
                value: { formatter: (v) => v + '%', color: '#fff', fontSize: '22px' },
            },
        },
    },
    chart: {
        background: 'transparent',   // ← this is the one that matters
        toolbar: { show: false },
    },
    colors: ['#1b6594'],
    theme: { mode: 'dark' },
};
</script>
