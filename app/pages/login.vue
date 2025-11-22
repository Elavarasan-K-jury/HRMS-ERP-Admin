<template>
    <div class="relative flex flex-col lg:flex-row min-h-screen overflow-hidden">
        <!-- gradient ambient background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute w-80 h-80 bg-brand-500/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
            <div
                class="absolute w-96 h-96 bg-plum-500/20 rounded-full blur-3xl top-1/2 -translate-y-1/2 right-0 animate-[float_8s_ease-in-out_infinite]">
            </div>
            <div
                class="absolute w-72 h-72 bg-rust-500/20 rounded-full blur-3xl bottom-0 left-1/2 -translate-x-1/2 animate-[float_10s_ease-in-out_infinite_reverse]">
            </div>
        </div>

        <!-- left promo panel -->
        <section
            class="relative flex-1 flex items-center justify-center text-center lg:text-left p-10 lg:p-16 text-white z-10">
            <div class="max-w-2xl">
                <h1 class="text-4xl lg:text-5xl font-semibold leading-tight mb-4">
                    Empower your
                    <span
                        class="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-plum-400 to-rust-400">
                        workflow
                    </span>
                    with ease
                </h1>
                <p class="text-white/70 text-base mb-6">
                    Join thousands of users optimizing their experience with our intelligent dashboard.
                    Access everything you need — smarter and faster.
                </p>

                <!-- image / promo carousel -->
                <div class="relative group overflow-hidden rounded-2xl border border-white/10 shadow-lg mb-6">
                    <img :src="promos[currentPromo].img" alt="promo"
                        class="w-full object-cover transition-all duration-700 ease-in-out" />
                    <div
                        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-4 flex flex-col justify-end">
                        <h3 class="text-lg font-medium">{{ promos[currentPromo].title }}</h3>
                        <p class="text-sm text-white/70">{{ promos[currentPromo].desc }}</p>
                    </div>
                </div>

                <div class="flex justify-center lg:justify-start gap-2">
                    <button v-for="(promo, i) in promos" :key="i" @click="currentPromo = i"
                        class="w-2.5 h-2.5 rounded-full transition-all"
                        :class="currentPromo === i ? 'bg-white' : 'bg-white/30 hover:bg-white/60'">
                    </button>
                </div>
            </div>
        </section>

        <!-- right login card -->
        <section class="relative flex-1 flex items-center justify-center z-10 p-6">
            <div class="w-full max-w-md p-8 rounded-3xl border border-white/15
               bg-white/10 backdrop-blur-2xl shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)]
               text-white">
                <div class="flex flex-col items-center mb-8">
                    <Icon name="ion:log-in-outline" class="text-7xl text-white/90 mb-3" />
                    <h1 class="text-2xl font-semibold tracking-wide">Welcome Back</h1>
                    <p class="text-sm text-white/70 mt-1">Login to your account</p>
                </div>

                <div class="space-y-5">
                    <div>
                        <label class="block text-sm text-white/70 mb-1">Email / Mobile</label>
                        <input v-model="username" required class="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20
                            focus:ring-2 focus:ring-brand-500/60 focus:border-transparent
                            placeholder:text-white/40 outline-none transition-all"
                            placeholder="you@example.com / +123456789" />
                    </div>

                    <div v-if="otpSent">
                        <label class="block text-sm text-white/70 mb-1">OTP</label>
                        <UiOtp class="w-full rounded-lg" v-model="otp" :length="6" @complete="done" />
                    </div>

                    <div class="flex items-center justify-between text-sm">
                        <label class="flex items-center gap-2 text-white/70">
                            <input type="checkbox" v-model="rememberMe"
                                class="w-4 h-4 rounded border-white/30 bg-white/10 text-brand-500 focus:ring-brand-500" />
                            Remember me
                        </label>
                    </div>

                    <button @click.prevent="handleLogin" class="w-full py-2.5 mt-4 rounded-xl bg-gradient-to-r from-brand-500 via-plum-500 to-rust-500
                   hover:opacity-90 transition-all font-medium shadow-lg shadow-black/20">
                        <span v-if="!loading">{{ otpSent ? 'Verify' : 'Login' }}</span>
                        <span v-else class="flex items-center justify-center gap-2">
                            <Icon name="ion:sync-outline" class="animate-spin text-lg" /> {{ otpSent ? 'Verifying...' :
                                'Logging in...' }}
                        </span>
                    </button>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth.store'
import { useThemeStore } from '../stores/theme.store'
import { storeToRefs } from 'pinia'

definePageMeta({
    public: true,           // ✅ middleware will skip auth checks
    layout: 'default',      // (optional) keep using your default layout
    key: route => route.fullPath
})

const authStore = useAuthStore()
const themeStore = useThemeStore()
const { username, otp, rememberMe } = storeToRefs(authStore)
const otpSent = computed(() => authStore.otpSent)
const loading = computed(() => authStore.loading)

const done = (data) => {
    console.log('OTP entered:', data)
}

const promos = ref([
    { img: '/images/promo1.png', title: 'Introducing Dark Mode 🌙', desc: 'Experience the new sleek dark theme for better focus.' },
    { img: '/images/promo2.png', title: 'Earn Rewards 🎁', desc: 'Get cashback and bonuses when you complete milestones.' },
    { img: '/images/promo3.png', title: 'Upgrade your Plan 🚀', desc: 'Unlock premium analytics and tools for faster growth.' },
])

const currentPromo = ref(0)
onMounted(() => {
    themeStore.preloader = false
    const auth = useAuthStore()
    if (!auth.accessToken) {
        auth.clearToken() // ensure clean state
    } else {
        auth.loadLocalData()
    }
    nextTick()

    setInterval(() => {
        currentPromo.value = (currentPromo.value + 1) % promos.value.length
    }, 5000)
})

async function handleLogin() {
    if (!otpSent.value) await authStore.login()
    else await authStore.verifyLogin()
}
</script>

<style scoped>
@keyframes float {

    0%,
    100% {
        transform: translateY(0) scale(1);
    }

    50% {
        transform: translateY(-20px) scale(1.05);
    }
}
</style>
