<template>
    <nav class="flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-3 py-1.5">
        <button v-for="t in tabs" :key="t.value" type="button" @click="$emit('change', t.value)"
            class="relative shrink-0 px-4 py-2 text-sm font-semibold uppercase tracking-wider border-b-2 rounded-t-xl transition-all duration-200"
            :class="t.value === active
                ? 'text-white bg-white/10 border-[#4aff7a]'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5 border-transparent'">
            {{ t.label }}
        </button>
    </nav>
</template>

<script setup>
defineProps({
    active: { type: String, default: 'about' },
})

defineEmits(['change'])

const tabs = [
    { label: 'About', value: 'about' },
    { label: 'Profile', value: 'profile' },
    { label: 'Job', value: 'job' },
    { label: 'Documents', value: 'documents' },
    { label: 'Assets', value: 'assets' },
]
</script>