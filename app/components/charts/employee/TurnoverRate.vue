<template>
    <ChartCard title="Turnover Rate" type="line" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{ name: 'Turnover %', data: [4, 3, 5, 6, 5, 4, 3, 6, 7, 5, 4, 4] }]
const options = {
    colors: ['#fff'],
    stroke: { width: 3, curve: 'smooth' },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], labels: { style: { colors: '#ccc' } } },
    yaxis: { labels: { style: { colors: '#ccc' } } },
    theme: { mode: 'dark' },
    chart: {
        background: 'transparent',   // ← this is the one that matters
        toolbar: { show: false },
    },
};
</script>
