<template>
    <section
        class="rounded-lg bg-white/10 border border-white/20 backdrop-blur-2xl p-2 px-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
            <p class="text-sm uppercase tracking-[0.35em] text-white/50 font-medium">
                Welcome
            </p>
            <h1 class="mt-2 text-2xl md:text-3xl font-semibold leading-tight">
                {{ username }}
            </h1>
            <p class="mt-2 text-xs md:text-sm text-white/65 max-w-xl">
                Here’s a snapshot of what’s happening across your workplace today.
            </p>
        </div>

        <!-- Avatar / Illustration placeholder -->
        <div class="mt-2 md:mt-0 flex items-center justify-end">
            <div
                class="relative h-24 w-24 rounded-3xl border border-white/15 bg-white/5 flex items-center justify-center shadow-[0_18px_70px_rgba(0,0,0,0.85)]">
                <div class="flex h-15 w-15 items-center justify-center rounded-lg border border-white/20 bg-white/10">
                    <Icon name="ion:image-outline" class="text-5xl text-white/80" />
                </div>
                <div
                    class="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/25 via-transparent to-pink-500/25 mix-blend-screen" />
            </div>
        </div>
    </section>
</template>

<script setup>
defineProps({
    username: {
        type: String,
        required: true,
    }
});
</script>
