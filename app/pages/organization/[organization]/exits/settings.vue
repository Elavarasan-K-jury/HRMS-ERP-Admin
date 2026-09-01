<template>
    <div class="p-2 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-3">
        <!-- Tabs -->
        <div class="flex gap-4 border-b border-white/10">
            <button
                class="px-1 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
                :class="activeTab === 'resignation' ? 'border-emerald-400 text-white' : 'border-transparent text-white/50 hover:text-white/80'"
                @click="setTab('resignation')"
            >
                Resignation & Termination
            </button>
            <button
                class="px-1 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
                :class="activeTab === 'notice' ? 'border-emerald-400 text-white' : 'border-transparent text-white/50 hover:text-white/80'"
                @click="setTab('notice')"
            >
                Notice Period
            </button>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto">
            <!-- Resignation & Termination Tab (Placeholder) -->
            <div v-if="activeTab === 'resignation'" class="h-full flex flex-col">
                <div class="h-full flex items-center justify-center">
                    <div class="text-center px-8">
                        <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-white/10 inline-block mb-6">
                            <Icon name="ion:document-text-outline" class="w-12 h-12 text-emerald-400" />
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Resignation & Termination Settings</h3>
                        <p class="text-white/60 mb-6 max-w-md mx-auto">
                            Configure resignation and termination settings including approval workflows, 
                            withdrawal rules, and employee-facing options.
                        </p>
                        <div class="bg-white/5 border border-white/10 rounded-xl p-6 text-left max-w-md mx-auto">
                            <div class="flex items-center gap-3 text-white/70 text-sm mb-4">
                                <Icon name="ion:checkbox-outline" class="w-5 h-5 text-emerald-400" />
                                <span>Allow employees to submit resignations</span>
                            </div>
                            <div class="flex items-center gap-3 text-white/70 text-sm mb-4">
                                <Icon name="ion:checkbox-outline" class="w-5 h-5 text-emerald-400" />
                                <span>Allow resignation withdrawal</span>
                            </div>
                            <div class="flex items-center gap-3 text-white/70 text-sm mb-4">
                                <Icon name="ion:checkbox-outline" class="w-5 h-5 text-emerald-400" />
                                <span>Allow early last working day preference</span>
                            </div>
                            <div class="flex items-center gap-3 text-white/70 text-sm mb-4">
                                <Icon name="ion:checkbox-outline" class="w-5 h-5 text-emerald-400" />
                                <span>Show approval status to employee</span>
                            </div>
                            <div class="flex items-center gap-3 text-white/70 text-sm">
                                <Icon name="ion:radio-button-on" class="w-5 h-5 text-emerald-400" />
                                <span>Review type: Acknowledgement</span>
                            </div>
                        </div>
                        <p class="text-white/50 text-sm mt-6">
                            Full implementation coming in Exit Process phase.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Notice Period Tab (Full Implementation) -->
            <div v-else class="h-full">
                <NoticePeriodTab :organization-id="orgId" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import NoticePeriodTab from '~/components/exits/NoticePeriodTab.vue'

definePageMeta({
    layout: 'organization',
    key: route => route.fullPath,
})

const route = useRoute()
const router = useRouter()
const orgId = route.params.organization

const validTabs = ['resignation', 'notice']
const initialTab = validTabs.includes(route.query.tab) ? route.query.tab : 'notice'
const activeTab = ref(initialTab)

const setTab = (tab) => {
    if (!validTabs.includes(tab)) return
    activeTab.value = tab
    router.replace({ query: { ...route.query, tab } })
}

watch(() => route.query.tab, (v) => {
    if (validTabs.includes(v) && v !== activeTab.value) activeTab.value = v
})

onMounted(() => {
    if (!route.query.tab) {
        router.replace({ query: { ...route.query, tab: activeTab.value } })
    }
})
</script>