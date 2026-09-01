<template>
    <div class="flex flex-col items-center justify-center gap-3 py-16">
        <Icon name="lucide:file-text" class="h-10 w-10 text-white/15" />
        <p class="text-sm text-white/40">No overview content available yet.</p>
    </div>
</template>

<script setup>
defineProps({
    employee: { type: Object, required: true },
})
</script>