<template>
    <ChartCard title="Average Tenure" type="radialBar" :series="[4.2]" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const options = {
    plotOptions: {
        radialBar: {
            hollow: { size: '70%' },
            dataLabels: {
                value: {
                    formatter: (v) => v + ' yrs',
                    color: '#fff',
                    fontSize: '20px',
                },
            },
        },
    },
    chart: {
        background: 'transparent',   // ← this is the one that matters
        toolbar: { show: false },
    },
    colors: ['#1b6594'],
};
</script>
