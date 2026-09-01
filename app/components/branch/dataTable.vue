<template>
    <div class="w-full">
        <div v-if="loading" class="flex flex-col gap-2">
            <div v-for="n in 5" :key="n"
                class="w-full h-12 rounded-lg bg-white/10 border border-white/15 animate-pulse"></div>
        </div>

        <div v-else-if="!items || items.length === 0"
            class="flex flex-col items-center justify-center py-10 text-white/50">
            <Icon name="lucide:building-2" class="text-4xl mb-3" />
            <p class="text-sm">No branches found</p>
        </div>

        <div v-else class="w-full overflow-x-auto">
            <table class="w-full text-left text-sm text-white/80">
                <thead>
                    <tr class="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                        <th class="py-3 px-4 font-medium">Name</th>
                        <th class="py-3 px-4 font-medium">Code</th>
                        <th class="py-3 px-4 font-medium">Description</th>
                        <th class="py-3 px-4 font-medium">Status</th>
                        <th class="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in items" :key="item.id"
                        class="border-b border-white/5 hover:bg-white/5 transition">
                        <td class="py-3 px-4 font-semibold">{{ item.name }}</td>
                        <td class="py-3 px-4 text-white/60">{{ item.code || '—' }}</td>
                        <td class="py-3 px-4 text-white/70 max-w-[260px] truncate">{{ item.description || '—' }}</td>
                        <td class="py-3 px-4">
                            <span :class="item.is_active
                                ? 'text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px] font-semibold'
                                : 'text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full text-[11px] font-semibold'">
                                {{ item.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-right">
                            <button @click="$emit('edit', item)"
                                class="text-blue-400 hover:text-blue-300 text-xs font-semibold mr-3">
                                Edit
                            </button>
                            <button @click="$emit('delete', item)"
                                class="text-red-400 hover:text-red-300 text-xs font-semibold">
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="totalPages > 1"
                class="flex items-center justify-between px-4 py-3 border-t border-white/10 text-xs text-white/60">
                <span>Page {{ page }} of {{ totalPages }}</span>
                <div class="flex gap-2">
                    <button :disabled="page <= 1" @click="$emit('prev')"
                        class="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30">
                        Prev
                    </button>
                    <button :disabled="page >= totalPages" @click="$emit('next')"
                        class="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30">
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    items: Array,
    loading: Boolean,
    total: Number,
    page: Number,
    totalPages: Number,
})

defineEmits(['edit', 'delete', 'prev', 'next'])
</script>
