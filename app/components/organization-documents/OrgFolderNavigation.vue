<template>
    <div class="flex h-full flex-col">
        <div class="px-3 py-3 border-b border-white/10">
            <UiSearch v-model="search" placeholder="Search folders..." color="#fff" size="sm" @search="onSearch" @clear="onSearch('')" />
        </div>

        <div v-if="loading" class="flex-1 overflow-y-auto p-2 space-y-1">
            <div v-for="i in 6" :key="i" class="animate-pulse p-3">
                <div class="skeleton w-28 h-4 mb-2" />
                <div class="skeleton w-14 h-3" />
            </div>
        </div>

        <div v-else-if="error" class="px-3 py-8 text-center text-white/50 text-xs">
            <Icon name="ion:alert-circle-outline" class="w-6 h-6 mx-auto mb-2 opacity-60" />
            <p>Could not load folders.</p>
            <button type="button" class="mt-2 text-emerald-300 underline underline-offset-2" @click="$emit('refresh')">Retry</button>
        </div>

        <div v-else-if="!folders?.length" class="px-3 py-8 text-center text-white/50 text-xs">
            <Icon name="ion:folder-open-outline" class="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p>No folders found</p>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-2 space-y-1">
            <button v-for="f in folders" :key="f.id" type="button"
                class="w-full text-left rounded-lg px-3 py-3 transition-colors border"
                :class="isSelected(f) ? 'bg-emerald-500/15 border-emerald-400/40' : 'border-transparent hover:bg-white/5'"
                @click="$emit('select', f)">
                <div class="flex items-center gap-2.5">
                    <span class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        :class="isSelected(f) ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/60'">
                        <Icon name="ion:folder" class="w-4 h-4" />
                    </span>
                    <div class="min-w-0 flex-1">
                        <span class="block text-sm font-medium truncate" :class="isSelected(f) ? 'text-emerald-200' : 'text-white/90'">{{ f.name }}</span>
                        <span class="block text-xs text-white/40">{{ f.document_count }} documents</span>
                    </div>
                    <Icon v-if="f.is_confidential" name="ion:lock-closed" class="w-3.5 h-3.5 text-amber-300/70 shrink-0" />
                </div>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    folders: { type: Array, default: () => [] },
    selectedId: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
})
const emit = defineEmits(['select', 'search', 'refresh'])

const search = ref('')
let debounce = null

function isSelected(f) { return String(f?.id) === String(props.selectedId) }

function onSearch(value) {
    search.value = value
    clearTimeout(debounce)
    debounce = setTimeout(() => emit('search', value), 350)
}
</script>
