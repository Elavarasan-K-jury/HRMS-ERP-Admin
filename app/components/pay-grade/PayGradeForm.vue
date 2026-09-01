<template>
    <form @submit.prevent="submit" class="flex flex-col gap-5">
        <div>
            <p class="text-md text-white/85 mb-1.5">Name <span class="text-rose-400">*</span></p>
            <FormInput v-model="name" class="w-full" prepend-icon="heroicons:currency-dollar" color="#4aff7a"
                size="md" rounded="lg" placeholder="e.g. A, B, C, D, Senior" @input="onNameInput" />
            <p v-if="errors.name" class="mt-1 text-xs text-rose-400">{{ errors.name }}</p>
        </div>

        <div>
            <p class="text-md text-white/85 mb-1.5">Description</p>
            <textarea v-model="description" rows="4" maxlength="2000"
                class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50 transition-colors resize-none"
                placeholder="Optional description, e.g. 10L - 14.9L"></textarea>
            <p v-if="errors.description" class="mt-1 text-xs text-rose-400">{{ errors.description }}</p>
        </div>
    </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    initial: { type: Object, default: null },
    saving: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const name = ref(props.initial?.name || '')
const description = ref(props.initial?.description || '')
const errors = ref({})

watch(() => props.initial, (v) => {
    name.value = v?.name || ''
    description.value = v?.description || ''
    errors.value = {}
})

const onNameInput = () => {
    if (errors.value.name && name.value.trim()) errors.value.name = ''
}

const submit = () => {
    errors.value = {}
    if (!name.value.trim()) {
        errors.value.name = 'Name is required.'
        return
    }
    if (name.value.trim().length > 100) {
        errors.value.name = 'Name must be at most 100 characters.'
        return
    }
    const cleanedDescription = description.value.trim().replace(/\s{2,}/g, ' ')

    emit('submit', {
        name: name.value.trim(),
        description: cleanedDescription || null,
    })
}

defineExpose({ submit })
</script>