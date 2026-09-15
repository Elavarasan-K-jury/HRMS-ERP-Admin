<template>
    <div class="rounded-lg bg-white/4 border border-white/10 backdrop-blur-2xl px-4 py-4 md:px-5 md:py-5 space-y-3">
        <!-- Tabs -->
        <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-4 text-xs md:text-sm">
                <button v-for="tab in tabs" :key="tab.value" type="button"
                    class="flex items-center gap-1 pb-1 border-b-2 transition-all duration-200" :class="tab.value === activeTab
                        ? 'border-sky-400 text-white'
                        : 'border-transparent text-white/55 hover:text-white/80'" @click="activeTab = tab.value">
                    <Icon :name="tab.icon" class="text-base" />
                    <span>{{ tab.label }}</span>
                </button>
            </div>
        </div>

        <!-- Textarea -->
        <div class="rounded-lg bg-black/20 border border-white/10 px-3 py-2">
            <textarea v-model="text" rows="3"
                class="w-full resize-none bg-transparent text-xs md:text-sm outline-none placeholder:text-white/40"
                placeholder="Write your post here and mention your peers…" />
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-3 pt-1">
            <div class="flex items-center gap-2 text-[11px] text-white/45">
                <button type="button" class="flex items-center gap-1 hover:text-white/80">
                    <Icon name="ion:image-outline" class="text-sm" />
                    <span>Image</span>
                </button>
                <button type="button" class="flex items-center gap-1 hover:text-white/80">
                    <Icon name="ion:at-outline" class="text-sm" />
                    <span>Mention</span>
                </button>
            </div>
            <UiButton color="#fff" size="sm" @click="handleSubmit">
                <Icon name="ion:share-social-outline" /> Share
            </UiButton>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const tabs = [
    { label: 'Post', value: 'post', icon: 'ion:create-outline' },
    { label: 'Poll', value: 'poll', icon: 'ion:list-outline' },
    { label: 'Praise', value: 'praise', icon: 'ion:happy-outline' }
]

const activeTab = ref('post')
const text = ref('')

const handleSubmit = () => {
    if (!text.value.trim()) return
    emit('submit', text.value.trim(), activeTab.value)
    text.value = ''
};
</script>
