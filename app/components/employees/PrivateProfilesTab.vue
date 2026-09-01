<template>
    <div class="flex flex-col gap-2">
        <div
            class="rounded-lg p-5 bg-white/10 border h-16 border-white/15 backdrop-blur-xl shadow-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold uppercase text-white/90">
                {{ profiles.length }} Private Profile<span>(s)</span>
            </h2>
            <div class="flex items-center gap-2">
                <FormSelect v-model="visibilityFilter" :options="visibilityOptions" placeholder="Visibility"
                    prepend-icon="lucide:eye" color="#fff" size="md" rounded="full" />
                <UiButton color="#fff" text="Reload" prepend-icon="ion:refresh" @click="fetchProfiles" />
            </div>
        </div>

        <div v-if="!filteredProfiles.length && !loading"
            class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-4 py-10 flex flex-col items-center justify-center gap-2 text-white/70">
            <Icon name="ion:lock-closed-outline" class="text-4xl opacity-60" />
            <span>No private profiles found.</span>
        </div>

        <div v-else
            class="rounded-lg border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg overflow-hidden">
            <table class="min-w-full text-sm text-white/90">
                <thead class="bg-white/10 backdrop-blur-md border-b border-white/10">
                    <tr>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Employee</th>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Designation</th>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Department</th>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Visibility</th>
                        <th class="px-4 py-3 text-left font-semibold uppercase text-[11px] tracking-wider text-white/60">Restricted By</th>
                        <th class="px-4 py-3 text-right font-semibold uppercase text-[11px] tracking-wider text-white/60">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="loading">
                        <tr v-for="i in 3" :key="i" class="border-b border-white/5 animate-pulse">
                            <td v-for="j in 6" :key="j" class="px-4 py-3">
                                <div class="h-4 rounded bg-white/10 w-3/4" />
                            </td>
                        </tr>
                    </template>
                    <tr v-for="profile in filteredProfiles" :key="profile.id"
                        class="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Icon name="ion:person" class="text-sm" />
                                </div>
                                <span class="font-medium">{{ profile.name }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3 text-white/70">{{ profile.designation }}</td>
                        <td class="px-4 py-3 text-white/70">{{ profile.department }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                :class="visibilityClass(profile.visibility)">
                                {{ profile.visibility }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-white/60 text-xs">{{ profile.restricted_by }}</td>
                        <td class="px-4 py-3 text-right">
                            <button @click="toggleVisibility(profile)"
                                class="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                :title="profile.visibility === 'Confidential' ? 'Make Visible' : 'Restrict'">
                                <Icon :name="profile.visibility === 'Confidential' ? 'ion:eye-off-outline' : 'ion:eye-outline'"
                                    class="text-lg text-white/70" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const visibilityFilter = ref(null)
const loading = ref(false)
const profiles = ref([])

const visibilityOptions = [
    { label: 'Confidential', value: 'Confidential' },
    { label: 'Restricted', value: 'Restricted' },
    { label: 'Visible', value: 'Visible' },
]

const filteredProfiles = computed(() => {
    if (!visibilityFilter.value) return profiles.value
    return profiles.value.filter(p => p.visibility === visibilityFilter.value)
})

const visibilityClass = (v) => {
    switch (v) {
        case 'Confidential': return 'bg-red-500/20 text-red-300'
        case 'Restricted': return 'bg-amber-500/20 text-amber-300'
        case 'Visible': return 'bg-emerald-500/20 text-emerald-300'
        default: return 'bg-white/10 text-white/60'
    }
}

const fetchProfiles = async () => {
    loading.value = true
    try {
        // TODO: Replace with actual API call
        await new Promise(r => setTimeout(r, 500))
        profiles.value = sampleProfiles
    } catch (err) {
        console.error('Failed to fetch private profiles:', err)
    } finally {
        loading.value = false
    }
}

const toggleVisibility = (profile) => {
    profile.visibility = profile.visibility === 'Confidential' ? 'Visible' : 'Confidential'
}

const handleRefresh = (e) => {
    if (e.detail.tab === 3) fetchProfiles()
}

onMounted(() => {
    fetchProfiles()
    window.addEventListener('refresh-tab', handleRefresh)
})

onBeforeUnmount(() => {
    window.removeEventListener('refresh-tab', handleRefresh)
})

const sampleProfiles = [
    { id: 1, name: 'Arun Kumar', designation: 'CEO', department: 'Executive', visibility: 'Confidential', restricted_by: 'Super Admin' },
    { id: 2, name: 'Neha Gupta', designation: 'CFO', department: 'Finance', visibility: 'Confidential', restricted_by: 'Super Admin' },
    { id: 3, name: 'Rajesh Verma', designation: 'VP Engineering', department: 'Engineering', visibility: 'Restricted', restricted_by: 'HR Admin' },
    { id: 4, name: 'Anita Desai', designation: 'HR Head', department: 'Human Resources', visibility: 'Restricted', restricted_by: 'HR Admin' },
    { id: 5, name: 'Suresh Iyer', designation: 'Security Lead', department: 'IT Security', visibility: 'Confidential', restricted_by: 'Super Admin' },
]
</script>
