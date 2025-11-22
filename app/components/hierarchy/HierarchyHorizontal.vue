<!-- HierarchyHorizontal.vue -->
<template>
    <div class="w-full overflow-x-auto py-8 px-6">
        <div class="flex justify-center min-w-max">
            <OrgNodeHorizontal v-if="root" :node="root" />

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center py-5 px-6">
                <div class="relative mb-5">
                    <!-- Animated background glow -->
                    <div
                        class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl rounded-full">
                    </div>

                    <!-- Icon container -->
                    <div class="relative w-24 h-24 rounded-full bg-gradient-to-br from-white/10 to-white/5 
                                border border-white/20 flex items-center justify-center backdrop-blur-xl
                                shadow-[0_8px_30px_rgba(0,0,0,.3)]">
                        <Icon name="lucide:users-round" class="w-12 h-12 text-white/40" />
                    </div>
                </div>

                <h3 class="text-xl font-bold text-white/90 mb-2">No Employees Found</h3>
                <p class="text-sm text-white/50 text-center max-w-sm mb-6">
                    The organization hierarchy is empty. Add employees to start building your org structure.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import OrgNodeHorizontal from './OrgNodeHorizontal.vue'

const props = defineProps({
    root: Object
});
</script>