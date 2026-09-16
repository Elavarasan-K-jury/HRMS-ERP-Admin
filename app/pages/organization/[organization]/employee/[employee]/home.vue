<template>
    <div v-if="!preloader && !loading" class="h-[calc(100vh-4rem)] overflow-y-auto text-white">
        <div class="max-w-full mx-auto p-2 space-y-2">

            <!-- TOP HERO -->
            <div class="rounded-lg bg-white/5 border border-white/10 backdrop-blur-2xl p-6">
                <h1 class="text-2xl font-semibold">Welcome, {{ username }}</h1>
            </div>

            <!-- EMPLOYEE DASHBOARD -->
            <div class="grid gap-2 md:grid-cols-12">
                <!-- LEFT COLUMN -->
                <div class="md:col-span-4 flex flex-col gap-2">
                    <div class="rounded-lg bg-white/5 border border-white/10 backdrop-blur-2xl p-5">
                        <h2 class="text-lg font-semibold mb-3">Good job!</h2>
                        <p class="text-sm text-white/50">You have no pending actions. Enjoy your day!</p>
                    </div>
                    <div class="rounded-lg bg-white/5 border border-white/10 backdrop-blur-2xl p-5">
                        <h2 class="text-lg font-semibold mb-3">On Leave Today</h2>
                        <p class="text-sm text-white/80">Everyone is at office!</p>
                        <p class="mt-1 text-xs text-white/55">No one is working remotely today.</p>
                    </div>
                    <div class="rounded-lg bg-white/5 border border-white/10 backdrop-blur-2xl p-5">
                        <h2 class="text-lg font-semibold mb-3">Upcoming Birthdays</h2>
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
                                        <p class="text-sm font-medium">{{ b.name }}</p>
                                        <p class="text-xs text-white/60">{{ b.date }}</p>
                                    </div>
                                </div>
                                <UiButton variant="ghost" size="xs">View</UiButton>
                            </div>
                        </div>
                        <p v-else class="text-xs text-white/55">No birthdays today.</p>
                    </div>
                    <div class="rounded-lg bg-white/5 border border-white/10 backdrop-blur-2xl p-5">
                        <h2 class="text-lg font-semibold mb-3">Time Today</h2>
                        <p class="text-xs text-white/55">{{ todayLabel }}</p>
                    </div>
                </div>

                <!-- RIGHT COLUMN -->
                <div class="md:col-span-8 flex flex-col gap-2">
                    <div class="rounded-lg bg-white/5 border border-white/10 backdrop-blur-2xl p-5">
                        <h2 class="text-lg font-semibold mb-3">Quick Actions</h2>
                        <p class="text-sm text-white/50">Use the sidebar to navigate to employee modules.</p>
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
import { useEmployeesStore } from '../../../../../stores/organization/employee.store'
import { useThemeStore } from '../../../../../stores/shared/theme.store'

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
