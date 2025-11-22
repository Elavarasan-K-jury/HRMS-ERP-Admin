<template>
    <ChartCard title="Source of Hire" type="donut" :series="[45, 35, 20]" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const options = {
    labels: ['Job Portal', 'Referral', 'Direct'],
    colors: ['#1b6594', '#9c3c1b', '#a27a65'],
    theme: { mode: 'dark' },
};
</script>
