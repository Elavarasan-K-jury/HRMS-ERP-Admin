<template>
    <div class="p-5 flex flex-col gap-4 min-h-0 overflow-y-auto glass-scroll">
        <div v-if="!costCenter" class="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Icon name="lucide:coins" class="text-4xl text-white/25" />
            <p class="text-sm text-white/50">Select a cost center to view its details.</p>
        </div>

        <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p class="text-[10px] uppercase tracking-[0.14em] text-white/45 mb-1">Cost Center Name</p>
                    <p class="text-sm font-semibold text-white/90">{{ costCenter.name }}</p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p class="text-[10px] uppercase tracking-[0.14em] text-white/45 mb-1">Cost Center Code</p>
                    <p class="text-sm font-semibold text-white/90 font-mono">{{ costCenter.code }}</p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4 md:col-span-2">
                    <p class="text-[10px] uppercase tracking-[0.14em] text-white/45 mb-1">Description</p>
                    <p class="text-sm text-white/80">{{ costCenter.description || '—' }}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex items-center gap-3">
                    <span class="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-400/15 border border-emerald-300/25">
                        <Icon name="lucide:users" class="w-5 h-5 text-emerald-300" />
                    </span>
                    <div>
                        <p class="text-[10px] uppercase tracking-[0.14em] text-white/45">Employees</p>
                        <p class="text-xl font-bold text-white/90">{{ costCenter.employee_count || 0 }}</p>
                    </div>
                </div>

                <div class="rounded-xl border border-white/10 bg-white/[0.04] p-4 flex items-center gap-3">
                    <span class="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-400/15 border border-sky-300/25">
                        <Icon name="lucide:user-circle" class="w-5 h-5 text-sky-300" />
                    </span>
                    <div>
                        <p class="text-[10px] uppercase tracking-[0.14em] text-white/45">Cost Center Head</p>
                        <p class="text-sm text-white/60">Not supported</p>
                    </div>
                </div>
            </div>

            <div v-if="!costCenter.employee_count" class="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 flex flex-col items-center gap-2 text-center">
                <Icon name="lucide:user-plus" class="text-3xl text-white/25" />
                <p class="text-sm text-white/70">No employees assigned yet</p>
                <p class="text-xs text-white/45">Go to the Employees tab to assign employees to this cost center.</p>
            </div>
        </template>
    </div>
</template>

<script setup>
defineProps({
    costCenter: { type: Object, default: null },
})
</script>

<style scoped>
.glass-scroll {
    scrollbar-width: thin;
}

.glass-scroll::-webkit-scrollbar {
    width: 6px;
}

.glass-scroll::-webkit-scrollbar-thumb {
    border-radius: 9999px;
    background: rgba(74, 255, 122, 0.25);
}
</style>