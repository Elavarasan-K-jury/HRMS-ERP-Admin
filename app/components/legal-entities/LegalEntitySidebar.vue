<template>
    <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-3 flex flex-col flex-1 min-h-0 overflow-hidden">
        <!-- Header -->
        <p class="px-1 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300/80 flex items-center gap-1.5">
            <Icon name="ion:business-outline" class="text-sm" />
            Legal Entities
        </p>

        <!-- Search -->
        <div class="pb-3">
            <UiSearch v-model="query" placeholder="Search legal entities…" color="#4aff7a" prepend-icon="ion:search-outline"
                clearable size="sm" rounded="lg" />
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 glass-scroll min-h-0">
            <div v-if="loading" class="flex items-center justify-center py-8">
                <UiLoader />
            </div>
            <template v-else>
                <div v-if="!filteredItems.length" class="flex flex-col items-center justify-center gap-2 py-8 text-center">
                    <Icon name="ion:business-outline" class="text-4xl text-white/30" />
                    <p class="text-xs text-white/50">No legal entities found.</p>
                    <UiButton size="xs" color="#4aff7a" text="Add Entity" prepend-icon="ion:add-circle"
                        @click="$emit('add')" />
                </div>

                <button v-for="item in filteredItems" :key="item.id" type="button"
                    class="group flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all"
                    :class="isActive(item.id)
                        ? 'bg-emerald-400/15 text-white ring-1 ring-emerald-300/40'
                        : 'hover:bg-white/10 text-white/80'"
                    @click="$emit('select', item.id)">
                    <span class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold uppercase"
                        :class="isActive(item.id)
                            ? 'bg-emerald-400/25 text-emerald-200'
                            : 'bg-white/10 text-white/60 group-hover:bg-white/15'">
                        {{ initials(item.name) }}
                    </span>
                    <span class="flex-1 min-w-0">
                        <span class="block truncate font-semibold" :class="isActive(item.id) ? 'text-white' : 'text-white/85'">
                            {{ item.name }}
                        </span>
                        <span class="block text-[11px]" :class="isActive(item.id) ? 'text-emerald-200/70' : 'text-white/45'">
                            {{ item.employee_count }} Employees
                        </span>
                    </span>
                    <Icon v-if="item.is_main" name="ion:star" title="Main Organization"
                        class="text-sm text-amber-300 flex-shrink-0" />
                </button>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    selectedId: { type: [String, Number], default: null },
    loading: { type: Boolean, default: false },
})

defineEmits(['select', 'add'])

const query = ref('')

const filteredItems = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return props.items
    return props.items.filter(i =>
        String(i.name || '').toLowerCase().includes(q)
        || String(i.employee_count || '').includes(q))
})

const isActive = (id) => String(id) === String(props.selectedId)

const initials = (name) => {
    if (!name) return 'LE'
    return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
</script>

<style scoped>
.glass-scroll {
    scrollbar-width: thin;
}

.glass-scroll::-webkit-scrollbar {
    width: 6px;
}

.glass-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 9999px;
}

.glass-scroll::-webkit-scrollbar-thumb {
    border-radius: 9999px;
    background: rgba(74, 255, 122, 0.25);
}
</style>