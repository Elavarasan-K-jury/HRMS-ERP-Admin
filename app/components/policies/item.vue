<template #PolicyItem>
    <div class="info-card group hover:bg-white/10 transition-all">
        <div class="info-label flex items-center gap-2">
            <Icon :name="icon" class="w-4 h-4 text-white/50 group-hover:text-white" />
            {{ label }}
        </div>
        <div class="info-value mt-1 text-white font-semibold">
            <slot />
        </div>
    </div>
</template>

<script setup name="PolicyItem">
const subProps = defineProps({
    label: String,
    icon: String
});
</script>

<style scoped>
.info-card {
    @apply p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm;
}

.info-label {
    @apply text-xs uppercase tracking-wide text-white/60;
}

.info-value {
    @apply text-base leading-relaxed;
}

/* Smooth fade-in animation */
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(6px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.35s ease-out;
}
</style>
