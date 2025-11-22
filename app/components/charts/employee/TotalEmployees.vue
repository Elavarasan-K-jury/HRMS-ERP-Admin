<template>
    <ChartCard height="100" title="Total Employees">
        <div class="text-center">
            <h1 class="text-4xl font-bold text-white">{{ total }}</h1>
            <p class="text-sm text-white/70 mt-1">Employees</p>
        </div>
    </ChartCard>
</template>

<script setup>
import ChartCard from '../ChartCard.vue'
const total = 250;
</script>
