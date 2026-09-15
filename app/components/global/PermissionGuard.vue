<template>
    <slot v-if="hasAccess" />
    <slot v-else name="fallback">
        <div v-if="showFallback" class="text-sm text-white/40 italic px-2">No access</div>
    </slot>
</template>

<script setup>
import { useAuthStore } from '~/stores/shared/auth.store'

const props = defineProps({
    permission: { type: String, required: true },
    showFallback: { type: Boolean, default: true },
})

const auth = useAuthStore()
const hasAccess = computed(() => auth.hasPermission(props.permission))
</script>
