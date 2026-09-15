<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-scroll flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90 capitalize">Leave</h2>
            <div class="flex items-center gap-2">
                <UiButton @click="reload" color="#fff" text="Reload" prepend-icon="ion:refresh" />
            </div>
        </div>
        <div class="rounded-lg p-8 bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg flex flex-col items-center justify-center gap-3 text-center">
            <Icon name="ion:calendar" class="w-14 h-14 text-white/40" />
            <h3 class="text-white/80 font-medium">Leave Module</h3>
            <p class="text-xs text-white/50 max-w-md">
                Leave management for assigned employees will be available here.
            </p>
        </div>
    </div>
</template>

<script setup>
definePageMeta({ layout: 'organization' })

const refreshKey = ref(0)
const reload = () => { refreshKey.value++ }
</script>