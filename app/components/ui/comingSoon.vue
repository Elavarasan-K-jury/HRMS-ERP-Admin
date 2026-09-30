<template>
    <div class="flex-1 flex flex-col items-center justify-center text-center gap-3 rounded-xl border border-white/15 bg-white/5 px-6 py-14"
        :data-testid="testid">
        <div class="h-12 w-12 flex items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/30">
            <Icon name="ion:hourglass-outline" class="text-2xl text-emerald-300" />
        </div>

        <h2 class="text-lg font-semibold text-white/90">{{ title }}</h2>

        <p v-if="description" class="text-sm text-white/60 max-w-md">{{ description }}</p>

        <span
            class="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
            Coming Soon
        </span>

        <p class="text-sm text-white/55 max-w-md">
            This feature is currently being prepared and will be available in a future release.
        </p>
    </div>
</template>

<script setup>
defineProps({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    testid: { type: String, default: 'coming-soon' },
})
</script>
