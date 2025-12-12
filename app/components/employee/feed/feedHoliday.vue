<template>
    <div class="p-4 rounded-lg bg-gradient-to-r from-red-500/60 to-orange-500/50 text-white shadow-lg">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="opacity-90">{{ date }}</p>
        <span class="text-xs mt-2 inline-block bg-white/20 rounded-md px-2 py-1">{{ type }}</span>
    </div>
</template>

<script setup>
defineProps({
    title: String,
    date: String,
    type: String
});
</script>
