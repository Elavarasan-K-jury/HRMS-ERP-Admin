<template>
    <form data-testid="ip-drawer" @submit.prevent="submit" class="flex flex-col gap-5">
        <!-- Information / instructions card -->
        <div class="rounded-xl border border-sky-300/25 bg-sky-400/10 px-4 py-3.5 text-white/85">
            <div class="flex items-center gap-2 mb-1.5">
                <Icon name="ion:information-circle" class="text-sky-300 text-lg" />
                <p class="text-sm font-semibold text-white/90">IP Whitelist Information</p>
            </div>
            <ul class="list-disc pl-5 space-y-1 text-xs leading-relaxed text-white/70">
                <li>Use your organization&rsquo;s public/WAN IP address for this configuration.</li>
                <li>Do not enter a private/local LAN IP if this configuration is intended for public access.</li>
                <li>This IP network configuration belongs to the organization.</li>
                <li>IP whitelist enforcement is active: only networks listed here can access this organization.</li>
            </ul>
        </div>

        <!-- Current IP detected by HRMS (gateway-observed; not a browser/public IP service) -->
        <div class="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3.5"
            data-testid="ip-hrms-current">
            <div class="flex items-center justify-between gap-3 mb-2">
                <div class="flex items-center gap-2">
                    <Icon name="ion:server-outline" class="text-emerald-300 text-lg" />
                    <p class="text-sm font-semibold text-white/90" data-testid="ip-hrms-current-title">
                        Current IP detected by HRMS
                    </p>
                </div>
                <UiButton type="button" color="#4aff7a" size="sm" text="Refresh"
                    prepend-icon="ion:refresh" :loading="detectState === 'loading'"
                    :disabled="detectState === 'loading'" data-testid="ip-hrms-refresh"
                    aria-label="Refresh detected IP" @click="detectCurrentIp" />
            </div>

            <template v-if="detectState === 'loading'">
                <p class="text-sm text-white/70" data-testid="ip-hrms-loading">Detecting current IP...</p>
            </template>

            <template v-else-if="detectState === 'error'">
                <p class="text-sm text-rose-300" data-testid="ip-hrms-error">
                    Unable to detect the IP currently seen by HRMS.
                </p>
                <p class="text-xs text-white/60 mt-1">You can still enter an IP address manually.</p>
            </template>

            <template v-else>
                <div class="flex flex-wrap items-center gap-2">
                    <span class="text-lg font-semibold text-white" data-testid="ip-current-address">{{ currentIp }}</span>
                    <span class="text-[10px] font-semibold uppercase tracking-wider rounded-md px-1.5 py-0.5 bg-emerald-400/20 text-emerald-200"
                        data-testid="ip-hrms-source">{{ detectIpType }} &middot; observed by HRMS server</span>
                </div>
                <p class="text-xs text-white/65 mt-1">
                    This is the IP address observed by the HRMS server and is the recommended value for this network.
                </p>

                <div v-if="isEdit" class="mt-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                    <p class="text-xs text-white/60">Saved Network:
                        <span class="font-semibold text-white/90" data-testid="ip-hrms-saved-address">{{ savedAddressLabel }}</span>
                    </p>
                </div>

                <div class="mt-3 flex items-center gap-3 flex-wrap">
                    <UiButton v-if="canUseCurrentIp" type="button" color="#4aff7a"
                        text="Use Current IP" prepend-icon="ion:flash" data-testid="ip-use-current-ip"
                        aria-label="Use Current IP" @click="useCurrentIp" />
                    <p v-else class="text-xs text-white/55" data-testid="ip-use-current-hint">{{ useCurrentIpHint }}</p>
                </div>
            </template>
        </div>

        <!-- Name of Network -->
        <div>
            <p class="text-md text-white/85 mb-1.5">Name of Network <span class="text-rose-400">*</span></p>
            <FormInput v-model="name" data-testid="ip-network-name-input" class="w-full"
                prepend-icon="ion:globe-outline" color="#4aff7a" size="md" rounded="lg"
                placeholder="Enter network name" :invalid="!!errors.name" maxlength="100"
                aria-label="Name of Network" @input="clearError('name')" />
            <p v-if="errors.name" class="mt-1 text-xs text-rose-400" data-testid="ip-name-error">{{ errors.name }}</p>
        </div>

        <!-- IP Type -->
        <div class="mb-6">
            <p class="text-md text-white/85 mb-1.5">IP Type</p>
            <div class="flex gap-6">
                <label class="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" v-model="ipType" :value="IP_TYPE.SINGLE" data-testid="ip-type-single"
                        class="w-4 h-4 text-emerald-400 bg-white/10 border-white/20 focus:ring-emerald-400/50" />
                    <span class="text-sm text-white/80 group-hover:text-white transition-colors">Single IP</span>
                </label>
                <label class="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" v-model="ipType" :value="IP_TYPE.RANGE" data-testid="ip-type-range"
                        class="w-4 h-4 text-emerald-400 bg-white/10 border-white/20 focus:ring-emerald-400/50" />
                    <span class="text-sm text-white/80 group-hover:text-white transition-colors">IP Range</span>
                </label>
            </div>
        </div>

        <!-- Single IP -->
        <div v-if="ipType === IP_TYPE.SINGLE">
            <p class="text-md text-white/85 mb-1.5">IP Address <span class="text-rose-400">*</span></p>
            <FormInput v-model="fromIp" data-testid="ip-from-input" class="w-full" prepend-icon="ion:lock-open-outline"
                color="#4aff7a" size="md" rounded="lg" placeholder="e.g. 157.50.204.195" :invalid="!!errors.fromIp"
                aria-label="IP Address" @input="clearError('fromIp')" />
            <p v-if="errors.fromIp" class="mt-1 text-xs text-rose-400" data-testid="ip-from-error">{{ errors.fromIp }}</p>
        </div>

        <!-- IP Range -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <p class="text-md text-white/85 mb-1.5">From <span class="text-rose-400">*</span></p>
                <FormInput v-model="fromIp" data-testid="ip-from-input" class="w-full" prepend-icon="ion:play-outline"
                    color="#4aff7a" size="md" rounded="lg" placeholder="e.g. 157.50.204.195" :invalid="!!errors.fromIp"
                    aria-label="From IP address" @input="clearError('fromIp')" />
                <p v-if="errors.fromIp" class="mt-1 text-xs text-rose-400" data-testid="ip-from-error">{{ errors.fromIp }}</p>
            </div>
            <div>
                <p class="text-md text-white/85 mb-1.5">To <span class="text-rose-400">*</span></p>
                <FormInput v-model="toIp" data-testid="ip-to-input" class="w-full" prepend-icon="ion:flag-outline"
                    color="#4aff7a" size="md" rounded="lg" placeholder="e.g. 157.50.204.200" :invalid="!!errors.toIp"
                    aria-label="To IP address" @input="clearError('toIp')" />
                <p v-if="errors.toIp" class="mt-1 text-xs text-rose-400" data-testid="ip-to-error">{{ errors.toIp }}</p>
            </div>
        </div>

        <!-- Whitelist this IP Network -->
        <div class="rounded-xl border border-white/15 bg-white/5 px-4 py-3.5">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <p class="text-sm font-medium text-white/90">Whitelist this IP Network</p>
                    <p class="mt-0.5 text-xs text-white/60">Enable this network as a trusted organization IP configuration.</p>
                </div>
                <UiSwitch v-model="isEnabled" data-testid="ip-whitelist-toggle" size="md"
                    aria-label="Whitelist this IP Network" />
            </div>
        </div>
    </form>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { IP_TYPE, ipNetworkAddress, fetchCurrentHrmsIp } from '~/data/ipNetwork'

const props = defineProps({
    initial: { type: Object, default: null },
    rows: { type: Array, default: () => [] },
    organizationId: { type: String, default: '' },
})

const emit = defineEmits(['submit'])

const name = ref('')
const ipType = ref(IP_TYPE.SINGLE)
const fromIp = ref('')
const toIp = ref('')
const isEnabled = ref(false)
const errors = ref({})

// Gateway-observed current IP (GET /ip-networks/current-ip via resolveClientIp)
const currentIp = ref(null)
const detectIpType = ref(null)
const detectState = ref('loading')

const isEdit = computed(() => !!props.initial)
const savedAddressLabel = computed(() => ipNetworkAddress(props.initial))

const detectCurrentIp = async () => {
    detectState.value = 'loading'
    const { $api } = useNuxtApp()
    const result = await fetchCurrentHrmsIp($api, props.organizationId)
    if (result.ok) {
        currentIp.value = result.ip
        detectIpType.value = result.ipType
        detectState.value = 'ready'
    } else {
        currentIp.value = null
        detectIpType.value = null
        if (result.error) console.warn('[ip-network-form] current-ip detection failed:', result.error)
        detectState.value = 'error'
    }
}

const canUseCurrentIp = computed(() =>
    detectState.value === 'ready'
    && !!currentIp.value
    && detectIpType.value === 'IPv4'
    && ipType.value === IP_TYPE.SINGLE)

const useCurrentIpHint = computed(() => {
    if (detectState.value !== 'ready' || !currentIp.value) return ''
    if (detectIpType.value !== 'IPv4') {
        return 'IP whitelist configurations currently support IPv4 addresses only.'
    }
    if (ipType.value !== IP_TYPE.SINGLE) {
        return 'Switch IP Type to Single IP to use the detected address.'
    }
    return ''
})

const useCurrentIp = () => {
    if (!canUseCurrentIp.value) return
    ipType.value = IP_TYPE.SINGLE
    fromIp.value = currentIp.value
    toIp.value = ''
    clearError('fromIp')
    clearError('toIp')
}

watch(() => props.initial, (v) => {
    name.value = v?.name || ''
    ipType.value = v?.ipType || IP_TYPE.SINGLE
    fromIp.value = v?.fromIp || ''
    toIp.value = v?.toIp || ''
    isEnabled.value = !!v?.isEnabled
    errors.value = {}
}, { immediate: true, deep: true })

watch(ipType, (v) => {
    if (v === IP_TYPE.SINGLE) {
        toIp.value = ''
        clearError('toIp')
    }
})

const clearError = (key) => {
    if (errors.value[key]) errors.value[key] = ''
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

const isValidIpv4 = (value) => IPV4.test(String(value || '').trim())

const ipToInt = (value) =>
    String(value).split('.').reduce((acc, oct) => (acc * 256) + Number(oct), 0)

const submit = () => {
    errors.value = {}
    const trimmedName = name.value.trim()
    const trimmedFrom = fromIp.value.trim()
    const trimmedTo = ipType.value === IP_TYPE.RANGE ? toIp.value.trim() : ''

    if (!trimmedName) {
        errors.value.name = 'Name of network is required.'
    } else if (trimmedName.length > 100) {
        errors.value.name = 'Name must be at most 100 characters.'
    }

    if (ipType.value === IP_TYPE.SINGLE) {
        if (!isValidIpv4(trimmedFrom)) {
            errors.value.fromIp = 'Enter a valid IPv4 address.'
        }
    } else {
        if (!isValidIpv4(trimmedFrom)) {
            errors.value.fromIp = 'Enter a valid IPv4 address.'
        }
        if (!isValidIpv4(trimmedTo)) {
            errors.value.toIp = 'Enter a valid IPv4 address.'
        }
        if (!errors.value.fromIp && !errors.value.toIp && ipToInt(trimmedFrom) > ipToInt(trimmedTo)) {
            errors.value.fromIp = 'From IP must be less than or equal to To IP.'
        }
    }

    if (Object.values(errors.value).some(Boolean)) return

    const editingId = props.initial?.id
    const duplicate = props.rows.some((row) =>
        row.id !== editingId
        && row.ipType === ipType.value
        && String(row.fromIp || '').trim() === trimmedFrom
        && String(row.toIp || '').trim() === trimmedTo)

    if (duplicate) {
        errors.value.fromIp = 'An identical IP network configuration already exists.'
        return
    }

    emit('submit', {
        name: trimmedName,
        ipType: ipType.value,
        fromIp: trimmedFrom,
        toIp: ipType.value === IP_TYPE.RANGE ? trimmedTo : null,
        isEnabled: !!isEnabled.value,
    })
}

onMounted(() => {
    detectCurrentIp()
})

defineExpose({ submit, detectCurrentIp })
</script>
