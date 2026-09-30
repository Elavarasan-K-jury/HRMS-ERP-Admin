<template>
    <header class="fixed right-0 top-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/15
           flex items-center justify-between px-4 h-[60px] shadow-sm transition-all duration-300"
        :class="sidebar ? 'w-[calc(100%-250px)]' : 'w-[calc(100%-85px)]'">

        <!-- LEFT -->
        <div class="flex items-center gap-4">
            <button @click="$emit('toggleSidebar')"
                class="p-2 flex items-center rounded-lg hover:bg-white/20 transition-all" aria-label="Toggle sidebar">
                <Icon name="ion:menu-outline" class="text-xl text-white" />
            </button>

            <nav aria-label="Breadcrumb" class="text-sm text-white/80">
                <ol class="flex items-center gap-1">
                    <li v-for="(crumb, index) in breadcrumbs" :key="index" class="flex items-center">
                        <span>{{ crumb }}</span>
                        <span v-if="index < breadcrumbs.length - 1" class="mx-1 text-white/50">/</span>
                    </li>
                </ol>
            </nav>
        </div>

        <!-- RIGHT -->
        <div class="flex items-center gap-3 relative">
            <!-- Notifications -->
            <div class="relative" ref="notifWrapper">
                <button @click="toggleMenu('notif')" ref="notifBtn"
                    class="relative p-2 rounded-lg flex items-center hover:bg-white/20 transition-all"
                    aria-label="Notifications">
                    <Icon name="ion:notifications-outline" class="text-xl text-white" />
                    <span v-if="unreadCount > 0"
                        class="absolute top-1.5 right-1.5 min-w-3 max-w-full h-3 px-[2px] bg-red-500 text-[10px] leading-3 text-white rounded-full grid place-items-center"
                        :title="`${unreadCount} new`">
                        {{ Math.min(unreadCount, 9) }}
                    </span>
                </button>
            </div>

            <!-- Wallet -->
            <div class="relative" ref="walletWrapper">
                <button @click="toggleMenu('wallet')" ref="walletBtn"
                    class="p-2 rounded-lg flex items-center hover:bg-white/20 transition-all" aria-label="Wallet">
                    <Icon name="ion:wallet-outline" class="text-xl text-white" />
                </button>
            </div>

            <!-- Profile -->
            <div class="relative" ref="profileWrapper">
                <button @click="toggleMenu('profile')" ref="profileBtn"
                    class="p-1.5 flex items-center rounded-full hover:ring-2 hover:ring-white/30 transition-all"
                    aria-label="Profile">
                    <Icon name="ion:person-outline" class="text-xl text-white" />
                </button>
            </div>
        </div>
    </header>

    <teleport to="body">

        <!-- Notifications -->
        <transition name="fade-scale">
            <div v-if="openMenu === 'notif'" class="fixed top-[65px] right-4 w-80 max-w-[92vw] rounded-2xl overflow-hidden
               bg-white/10 backdrop-blur-xl border border-white/15 shadow-xl z-[100]">
                <div class="flex items-center justify-between px-4 py-3">
                    <div class="flex items-center gap-2">
                        <Icon name="ion:notifications" class="text-white/90" />
                        <span class="text-white/90 font-medium">Notifications</span>
                    </div>
                    <button class="text-xs text-white/70 hover:text-white/90" @click="markAllRead">Mark all
                        read</button>
                </div>
                <div class="h-px bg-white/10"></div>

                <ul class="max-h-80 overflow-auto divide-y divide-white/10">
                    <li v-for="n in notifications" :key="n.id" class="bg-white/0 hover:bg-white/10 transition-colors">
                        <div class="flex items-start gap-3 px-4 py-3">
                            <div class="relative shrink-0">
                                <div
                                    class="w-9 h-9 rounded-xl grid place-items-center bg-white/15 border border-white/20">
                                    <Icon :name="n.icon" class="text-white text-lg" />
                                </div>
                                <span v-if="n.unread"
                                    class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm text-white/90 font-medium truncate">{{ n.title }}</p>
                                <p class="text-xs text-white/70 line-clamp-2">{{ n.message }}</p>
                                <p class="text-[11px] text-white/50 mt-1">{{ n.time }}</p>
                            </div>
                        </div>
                    </li>
                    <li v-if="notifications.length === 0" class="px-4 py-6 text-center">
                        <p class="text-sm text-white/70">No new notifications</p>
                    </li>
                </ul>

                <div class="h-px bg-white/10"></div>
                <div class="px-4 py-2 flex items-center justify-between">
                    <button class="text-xs text-white/70 hover:text-white/90 hover:underline"
                        @click="closeMenu">Close</button>
                    <a href="#" class="text-xs text-brand-200 hover:text-white/90">View all</a>
                </div>
            </div>
        </transition>

        <!-- Wallet -->
        <transition name="fade-scale">
            <div v-if="openMenu === 'wallet'" class="fixed top-[65px] right-4 w-80 max-w-[92vw] rounded-2xl overflow-hidden
               bg-white/10 backdrop-blur-3xl border border-white/15 shadow-xl z-[100]">
                <div class="flex items-center justify-between px-4 py-3">
                    <div class="flex items-center gap-2">
                        <Icon name="ion:wallet" class="text-white/90" />
                        <span class="text-white/90 font-medium">Wallet</span>
                    </div>
                    <button class="text-xs text-white/70 hover:text-white/90" @click="addFunds">Add funds</button>
                </div>
                <div class="h-px bg-white/10"></div>

                <div class="px-4 py-4 flex items-center justify-between">
                    <span class="text-white/70 text-sm">Current Balance</span>
                    <span class="text-lg font-semibold text-white/90">{{ currency(balance) }}</span>
                </div>

                <div class="h-px bg-white/10"></div>

                <ul class="max-h-72 overflow-auto divide-y divide-white/10">
                    <li v-for="t in transactions" :key="t.id"
                        class="flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl grid place-items-center bg-white/15 border border-white/20">
                                <Icon :name="t.icon" class="text-white text-lg" />
                            </div>
                            <div>
                                <p class="text-sm text-white/90 font-medium">{{ t.title }}</p>
                                <p class="text-xs text-white/60">{{ t.time }}</p>
                            </div>
                        </div>
                        <p :class="t.amount > 0 ? 'text-green-400' : 'text-red-400'" class="text-sm font-medium">
                            {{ t.amount > 0 ? '+' : '' }}{{ currency(t.amount) }}
                        </p>
                    </li>
                </ul>

                <div class="h-px bg-white/10"></div>
                <div class="px-4 py-2 flex items-center justify-between">
                    <button class="text-xs text-white/70 hover:text-white/90 hover:underline"
                        @click="closeMenu">Close</button>
                    <a href="#" class="text-xs text-brand-200 hover:text-white/90">View all</a>
                </div>
            </div>
        </transition>

        <!-- Profile -->
        <transition name="fade-scale">
            <div v-if="openMenu === 'profile'" class="fixed top-[65px] right-4 w-64 max-w-[90vw] rounded-2xl overflow-hidden
               bg-white/10 backdrop-blur-xl border border-white/15 shadow-xl z-[100]">
                <div class="flex flex-col divide-y divide-white/10">
                    <div class="px-4 py-4 flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-white/20 grid place-items-center border border-white/30">
                            <Icon name="ion:person" class="text-white text-xl" />
                        </div>
                        <div>
                            <p class="text-white/90 font-medium text-sm">{{ displayName }}</p>
                            <p class="text-white/60 text-xs">{{ displayEmail }}</p>
                        </div>
                    </div>

                    <NuxtLink :to="profileLink" @click="closeMenu"
                        class="px-4 py-3 flex items-center gap-3 text-sm text-white/80 hover:bg-white/15 transition-all">
                        <Icon name="ion:person-outline" class="text-lg" />
                        <span>My Profile</span>
                    </NuxtLink>

                    <button
                        class="px-4 py-3 flex items-center gap-3 text-sm text-white/80 hover:bg-white/15 transition-all">
                        <Icon name="ion:contrast-outline" class="text-lg" />
                        <span>Display Mode</span>
                    </button>

                    <button
                        class="px-4 py-3 flex items-center gap-3 text-sm text-white/80 hover:bg-white/15 transition-all">
                        <Icon name="ion:settings-outline" class="text-lg" />
                        <span>User Preference</span>
                    </button>

                    <button @click="showLogoutConfirm = true"
                        class="px-4 py-3 flex items-center gap-3 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                        <Icon name="ion:log-out-outline" class="text-lg" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </transition>

    </teleport>

    <!-- Logout Confirmation -->
    <transition name="fade-scale">
        <div v-if="showLogoutConfirm"
            class="fixed inset-0 z-[999] flex items-center justify-center bg-white/10 backdrop-blur-sm">
            <div
                class="w-[320px] rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-2xl p-6 text-center">
                <Icon name="ion:log-out-outline" class="text-3xl text-red-400 mb-3" />
                <h3 class="text-white/90 font-semibold text-lg mb-1">Confirm Logout</h3>
                <p class="text-white/70 text-sm mb-6">Are you sure you want to logout?</p>
                <div class="flex justify-center gap-3">
                    <button @click="showLogoutConfirm = false"
                        class="px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all text-sm">
                        Cancel
                    </button>
                    <button @click="logout"
                        class="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all text-sm">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../../stores/shared/theme.store'
import { useAuthStore } from '../../stores/shared/auth.store'

const route = useRoute()
const themeStore = useThemeStore()
const sidebar = computed(() => themeStore.sidebar)
const adminStore = useAuthStore()

const currentUser = computed(() => adminStore.admin || adminStore.user)

const displayName = computed(() => {
    if (adminStore.isSuperAdmin) return 'Super Admin'
    if (adminStore.isEmployee) {
        return currentUser.value?.full_name || 'Employee'
    }
    return 'Admin'
})

const displayEmail = computed(() => currentUser.value?.email || '')

const profileLink = computed(() => {
    if (adminStore.isEmployee) return '/employee/profile'
    const org = adminStore.organization
    const emp = adminStore.employee
    if (org && emp) return `/organization/${org}/employee/${emp}/profile`
    if (adminStore.admin?.organization_id && adminStore.admin?.id) {
        return `/organization/${adminStore.admin.organization_id}/employee/${adminStore.admin.id}/profile`
    }
    return '/profile'
})

const props = defineProps({
    breadcrumbs: {
        type: Array,
        default: () => ['Dashboard', 'Overview'],
    },
})

defineEmits(['toggleSidebar'])

const openMenu = ref(null)
const showLogoutConfirm = ref(false)

function toggleMenu(menu) {
    openMenu.value = openMenu.value === menu ? null : menu
}
function closeMenu() {
    openMenu.value = null
}

const notifications = ref([
    { id: 1, title: 'Payment received', message: '1,200 added to your wallet.', time: '2m ago', unread: true, icon: 'ion:card-outline' },
    { id: 2, title: 'New message', message: 'Support replied to your ticket.', time: '1h ago', unread: true, icon: 'ion:chatbubbles-outline' },
])
const unreadCount = computed(() => notifications.value.filter(n => n.unread).length)
function markAllRead() { notifications.value.forEach(n => (n.unread = false)) }

const balance = ref(12450)
const transactions = ref([
    { id: 1, title: 'Deposit', time: 'Today 3:45 PM', amount: 2500, icon: 'ion:cash-outline' },
    { id: 2, title: 'Reimbursement', time: 'Yesterday 9:10 AM', amount: 799, icon: 'ion:card-outline' },
])
function addFunds() {
    balance.value += 1000
    transactions.value.unshift({ id: Date.now(), title: 'Manual Top-up', time: 'Just now', amount: 1000, icon: 'ion:add-circle-outline' })
}

function currency(v) {
    return v.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
}

function logout() {
    showLogoutConfirm.value = false
    adminStore.logout()
    closeMenu()
}

const notifWrapper = ref(null)
const walletWrapper = ref(null)
const profileWrapper = ref(null)
function onClickOutside(e) {
    if (!openMenu.value) return
    const wrappers = [notifWrapper.value, walletWrapper.value, profileWrapper.value]
    if (!wrappers.some(el => el && el.contains(e.target))) closeMenu()
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: opacity .15s ease, transform .15s ease;
    transform-origin: top right;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
    opacity: 0;
    transform: scale(.96) translateY(-6px);
}

.fade-blur-enter-active,
.fade-blur-leave-active {
    transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}

.fade-blur-enter-from,
.fade-blur-leave-to {
    opacity: 0;
    backdrop-filter: blur(0px);
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
