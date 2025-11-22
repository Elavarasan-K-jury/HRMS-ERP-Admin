<template>
    <ChartCard title="Applicants per Job Posting" type="bar" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Applicants', data: [30, 25, 18, 40, 22] }]
const options = {
    colors: ['#1b6594'],
    xaxis: { categories: ['HR', 'Dev', 'Finance', 'Ops', 'Design'], labels: { style: { colors: '#ccc' } } },
    theme: { mode: 'dark' },
};
</script>
