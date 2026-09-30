<template>
    <UiModal v-model="open" title="Access restricted" size="sm" :showClose="false" :showFooter="true"
        :zIndex="150">
        <template #default>
            <div data-testid="ip-restricted-modal" class="space-y-3 text-sm text-gray-300">
                <p class="font-semibold text-white text-base" data-testid="ip-restricted-message">
                    {{ message }}
                </p>
                <p>
                    Your current network is not authorized for this organization. Contact your
                    administrator to allowlist this IP address, or continue from an approved network.
                </p>
            </div>
        </template>
        <template #footer>
            <div class="flex w-full items-center justify-end gap-3">
                <button type="button" data-testid="ip-restricted-logout" @click="onLogout"
                    class="rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-white/40 hover:text-white">
                    Back to login
                </button>
                <button type="button" data-testid="ip-restricted-retry" @click="onRetry"
                    class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600">
                    Retry
                </button>
            </div>
        </template>
    </UiModal>
</template>

<script setup>
import { useAuthStore } from '~/stores/shared/auth.store'
import { useIpRestriction, IP_RESTRICTED_MESSAGE } from '~/composables/useIpRestriction'

const { restricted, clearIpRestricted } = useIpRestriction()

const open = computed({
    get: () => restricted.value,
    set: (value) => {
        if (!value) clearIpRestricted()
    },
})

const message = IP_RESTRICTED_MESSAGE

const onRetry = () => {
    window.location.reload()
}

const onLogout = async () => {
    const authStore = useAuthStore()
    await authStore.logout('/login')
}
</script>
