<template>
    <div class="w-full h-screen text-white flex items-center justify-center">

        <!-- 🌀 Loader -->
        <div v-if="loading" class="flex items-center justify-center w-full h-full">
            <UiLoader />
        </div>

        <!-- ❌ Missing URL -->
        <div v-else-if="!hasPdf" class="flex flex-col items-center justify-center gap-3 px-2 text-center">
            <p class="text-red-300 text-sm sm:text-base">
                Missing <span class="font-mono bg-white/10 px-2 py-0.5 rounded">?url=</span> query in URL.
            </p>
        </div>

        <!-- 📑 PDF Viewer -->
        <div v-else class="w-full h-full p-2 sm:p-2">
            <div class="w-full h-full rounded-lg border border-white/20 bg-white/10
               shadow-[0_18px_60px_rgba(0,0,0,0.7)]
               backdrop-blur-2xl overflow-hidden flex flex-col">
                <!-- Top bar -->
                <div class="px-4 sm:px-5 py-2.5 border-b border-white/20
                 bg-white-10 backdrop-blur-md flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3">

                        <div class="flex flex-col">
                            <span class="text-xs font-semibold tracking-wide text-white/80">
                                PDF Viewer
                            </span>
                            <div class="hidden sm:block text-xs text-white/60 truncate text-right">
                                {{ getFileName(pdfUrl) }}
                            </div>
                        </div>
                    </div>

                </div>

                <!-- PDF area -->
                <div class="flex-1 bg-black">
                    <iframe :src="pdfUrl" class="w-full h-full" frameborder="0" title="PDF Viewer" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()

const loading = ref(true)

// ✅ Get pdfUrl from query (?url=...)
const rawUrl = computed(() => route.query.url || '')

// Handle possible array type from query
const pdfUrl = computed(() => {
    if (Array.isArray(rawUrl.value)) return rawUrl.value[0]
    return rawUrl.value
})

const hasPdf = computed(() => !!pdfUrl.value)

const getFileName = (url) => {
    if (!url) return ''
    try {
        return decodeURIComponent(url.split('/').pop())
    } catch {
        return url
    }
}

onMounted(() => {
    console.log('📄 PDF Viewer URL:', pdfUrl.value)
    // Fake loading for smoother UX (optional)
    setTimeout(() => {
        loading.value = false
    }, 500)
});
</script>
