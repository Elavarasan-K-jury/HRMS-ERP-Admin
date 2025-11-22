<template>
    <ChartCard title="Designation Hierarchy" type="treemap" :series="series" :options="options" />
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const series = [{
    data: [
        { x: 'Executives', y: 10 },
        { x: 'Managers', y: 20 },
        { x: 'Senior Staff', y: 40 },
        { x: 'Staff', y: 60 },
        { x: 'Interns', y: 10 },
    ]
}]
const options = {
    colors: ['#392651', '#1b6594', '#9c3c1b', '#a27a65', '#8db2ca'],
    dataLabels: { style: { colors: ['#fff'] } },
    theme: { mode: 'dark' },
};
</script>
