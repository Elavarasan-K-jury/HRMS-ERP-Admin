<template>
    <div v-if="!preloader && !loading" class="h-[calc(100vh-4rem)] overflow-y-auto  text-white">
        <div class="max-w-full mx-auto p-2 space-y-2">

            <feedHero :username="username" />

            <div class="rounded-lg bg-white/5 border border-white/10  backdrop-blur-2xl p-2 px-4 space-y-2">
                <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p class="text-lg uppercase tracking-[0.3em] text-white/40 font-medium">
                            Dashboard
                        </p>
                        <h2 class="mt-1 text-2xl font-semibold">
                            Employee Feed
                        </h2>
                    </div>

                    <div
                        class="inline-flex items-center rounded-full bg-white/5 border border-white/10 p-1 text-xs md:text-sm">
                        <button v-for="tab in feedTabs" :key="tab.value" type="button"
                            class="px-4 py-1.5 rounded-full transition-all duration-200" :class="tab.value === activeFeedTab
                                ? 'bg-white/90 text-slate-900 shadow-[0_6px_20px_rgba(0,0,0,0.45)]'
                                : 'text-white/60 hover:bg-white/10'" @click="activeFeedTab = tab.value">
                            {{ tab.label }}
                        </button>
                    </div>
                </div>

                <div class="grid gap-2 md:grid-cols-12">
                    <div class="md:col-span-4 flex flex-col gap-2">
                        <feedCard title="Good job!" subtitle="You have no pending actions" eyebrow="Inbox">
                            <template #icon>
                                <div
                                    class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/10 border border-pink-500/30">
                                    <Icon name="ion:gift-outline" class="text-2xl text-pink-300" />
                                </div>
                            </template>

                            <p class="mt-3 text-sm text-white/50">
                                Everything's up to date. Enjoy your day! 🎉
                            </p>
                        </feedCard>
                        <FeedHoliday />
                        <feedCard title="On Leave Today">
                            <p class="text-sm text-white/80">
                                Everyone is at office!
                            </p>
                            <p class="mt-1 text-xs text-white/55">
                                No one is working remotely today.
                            </p>
                        </feedCard>
                        <feedCard title="Upcoming Birthdays">
                            <div v-if="upcomingBirthdays.length" class="space-y-3">
                                <div v-for="b in upcomingBirthdays" :key="b.id"
                                    class="flex items-center justify-between gap-3">
                                    <div class="flex items-center gap-3">
                                        <div class="relative h-10 w-10">
                                            <img :src="b.avatar" alt=""
                                                class="h-10 w-10 rounded-full object-cover border border-white/20" />
                                            <span
                                                class="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border border-slate-900 bg-emerald-400" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium">
                                                {{ b.name }}
                                            </p>
                                            <p class="text-xs text-white/60">
                                                {{ b.date }}
                                            </p>
                                        </div>
                                    </div>
                                    <UiButton variant="ghost" size="xs">
                                        View
                                    </UiButton>
                                </div>
                            </div>
                            <p v-else class="text-xs text-white/55">
                                No birthdays today.
                            </p>
                        </feedCard>
                        <feedCard title="Time Today" :subtitle="todayLabel">
                            <AttendanceCheckin />
                        </feedCard>
                    </div>

                    <div class="md:col-span-8 flex flex-col h-[calc(100vh-18.25rem)] overflow-y-auto gap-2">
                        <feedComposer @submit="createPost" />
                        <feedCard title="Be a Workplace Change-Maker!">
                            <p class="text-xs text-white/65">
                                This week's Pulse Survey is ready. Share your insights to make the
                                workplace more awesome.
                            </p>
                            <div class="mt-4 flex justify-end">
                                <UiButton color="#fff">
                                    Start Pulse 🚀
                                </UiButton>
                            </div>
                        </feedCard>
                        <div v-if="posts.length" class="space-y-3 pt-2 border-t border-white/5 mt-4">
                            <p class="text-xs uppercase tracking-[0.25em] text-white/40 font-medium">
                                Recent Posts
                            </p>
                            <feedPost v-for="(p, i) in posts" :key="i" :post="p" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-slate-950">
        <UiLoader />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEmployeesStore } from '../../../../../stores/employee.store'
import { useThemeStore } from '../../../../../stores/theme.store'

import feedHero from '../../../../../components/employee/feed/feedHero.vue'
import feedCard from '../../../../../components/employee/feed/feedCard.vue'
import feedComposer from '../../../../../components/employee/feed/feedComposer.vue'
import feedPost from '../../../../../components/employee/feed/feedPost.vue'
import FeedHoliday from '../../../../../components/employee/feed/holiday.vue'

definePageMeta({ layout: 'employee' })

const route = useRoute()
const themeStore = useThemeStore()
const employeesStore = useEmployeesStore()

const preloader = computed(() => themeStore.preloader)
const loading = ref(true)
const employee = ref(null)

const username = computed(() =>
    employee.value?.full_name ||
    [employee.value?.first_name, employee.value?.last_name].filter(Boolean).join(' ') ||
    'Employee'
)

onMounted(async () => {
    if (route.params.employee) {
        const data = await employeesStore.fetchEmployee(route.params.employee)
        employee.value = data?.employee || null
    }
    loading.value = false
})

const posts = ref([])

const createPost = (text, kind = 'post') => {
    if (!text?.trim()) return

    posts.value.unshift({
        user: username.value,
        role: 'Employee',
        time: 'Just now',
        content: text,
        type: kind,
        likes: 0,
        comments: 0,
        images: []
    })
}

const feedTabs = [
    { label: 'Organization', value: 'org' },
    { label: 'Technical (Tech)', value: 'tech' }
]
const activeFeedTab = ref('org')

const todayLabel = computed(() => {
    const d = new Date()
    const date = d.toLocaleDateString(undefined, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
    return `Today · ${date}`
})

const upcomingBirthdays = ref([
    {
        id: 1,
        name: 'Sathyangray',
        date: '28 November',
    }
]);
</script>


<!-- <template></template>
<script setup>
definePageMeta({
    layout: 'employee',
});
</script> -->