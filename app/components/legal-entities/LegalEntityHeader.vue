<template>
    <div class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg p-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
            <!-- Icon only (logo moved to the right) -->
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-slate-700/40 border border-emerald-300/20 flex items-center justify-center flex-shrink-0">
                <Icon name="ion:business" class="text-2xl text-emerald-200/80" />
            </div>
            <div class="min-w-0">
                <h3 class="text-lg font-semibold text-white/90 truncate">{{ entity?.name || '—' }}</h3>
                <p class="text-xs text-white/50">{{ entity?.employee_count || 0 }} Employees</p>
            </div>
        </div>

        <div class="flex items-center gap-3 flex-shrink-0">
            <!-- Logo (where the Edit button used to be) -->
            <div v-if="entityLogo" class="h-12 rounded-lg border border-white/20 bg-white/5 flex items-center justify-center overflow-hidden px-1"
                :title="entity?.name || 'Logo'">
                <img :src="entityLogo" alt="logo" class="h-full w-auto object-contain" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { resolveMediaUrl } from '~/utils/media'

const props = defineProps({
    entity: { type: Object, default: null },
})

const entityLogo = computed(() => {
    const e = props.entity
    if (e?.logo_file_id) return resolveMediaUrl(`/file/${e.logo_file_id}`)
    if (e?.logo) return resolveMediaUrl(e.logo)
    return ''
})

defineEmits(['edit'])
</script>