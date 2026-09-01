<template>
    <form @submit.prevent="submit" class="flex flex-col gap-5">
        <div>
            <p class="text-md text-white/85 mb-1.5">Cost Center Name <span class="text-rose-400">*</span></p>
            <FormInput v-model="name" class="w-full" prepend-icon="lucide:coins" color="#4aff7a" size="md"
                rounded="lg" placeholder="e.g. Engineering" />
            <p v-if="errors.name" class="mt-1 text-xs text-rose-400">{{ errors.name }}</p>
        </div>

        <div>
            <p class="text-md text-white/85 mb-1.5">Cost Center Code <span class="text-rose-400">*</span></p>
            <FormInput v-model="code" class="w-full" prepend-icon="lucide:hash" color="#4aff7a" size="md"
                rounded="lg" placeholder="e.g. ENG-001" />
            <p v-if="errors.code" class="mt-1 text-xs text-rose-400">{{ errors.code }}</p>
        </div>

        <div>
            <p class="text-md text-white/85 mb-1.5">Description</p>
            <textarea v-model="description" rows="4"
                class="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50 transition-colors resize-none"
                placeholder="Optional description of this cost center"></textarea>
        </div>
    </form>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    initial: { type: Object, default: null },
})

const emit = defineEmits(['submit'])

const name = ref(props.initial?.name || '')
const code = ref(props.initial?.code || '')
const description = ref(props.initial?.description || '')
const errors = ref({})

const submit = () => {
    errors.value = {}
    if (!name.value.trim()) errors.value.name = 'Name is required.'
    if (!code.value.trim()) errors.value.code = 'Code is required.'
    if (Object.keys(errors.value).length) return

    emit('submit', {
        name: name.value.trim(),
        code: code.value.trim(),
        description: description.value.trim() || null,
    })
}
</script>