<template>
    <div class="flex flex-col gap-3">
        <!-- Entity (Organization / Branch) -->
        <div class="w-full flex flex-col items-start">
            <p class="text-md text-white/80">Location For:</p>
            <FormSelect v-model="form.entity" :options="entityOptions" searchable clearable
                prepend-icon="ion:business" color="#fff" size="md" rounded="lg" placeholder="Select Branch or Organization" />
        </div>

        <!-- Headquarters -->
        <div class="w-full flex items-center justify-between rounded-lg border border-white/15 bg-black/20 px-3 py-2.5">
            <div>
                <p class="text-sm text-white/90">Headquarters</p>
                <p class="text-xs text-white/50">Mark this as the main / head office location.</p>
            </div>
            <UiSwitch v-model="form.is_headquarters" color="#4aff7a" size="md" />
        </div>

        <!-- Timezone -->
        <div class="w-full flex flex-col items-start">
            <p class="text-md text-white/80">Timezone:</p>
            <div class="relative w-full">
                <Icon name="ion:globe-outline" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/40" />
                <select v-model="form.timezone" class="w-full rounded-lg border border-white/15 bg-black/20 py-2 pl-10 pr-3 text-sm text-white/90 outline-none transition focus:border-emerald-300/60 [color-scheme:dark]">
                    <option value="">Select timezone</option>
                    <optgroup v-for="group in timezoneGroups" :key="group.label" :label="group.label">
                        <option v-for="zone in group.zones" :key="zone.value" :value="zone.value">{{ zone.label }}</option>
                    </optgroup>
                </select>
            </div>
        </div>

        <!-- Google Places Search -->
        <div class="w-full flex flex-col items-start">
            <p class="text-md text-white/80">Search Location:</p>
            <LocationAddressAutocomplete v-model="form.searchQuery" placeholder="Search address, city, pincode..."
                class="w-full" @place="onPlace" />
        </div>

        <!-- Country & State -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="w-full flex flex-col items-start">
                <p class="text-md text-white/80">Country:</p>
                <FormInput class="w-full" v-model="form.country" prepend-icon="ion:flag-outline" color="#fff" size="md"
                    rounded="lg" placeholder="Country" />
            </div>
            <div class="w-full flex flex-col items-start">
                <p class="text-md text-white/80">State:</p>
                <FormInput class="w-full" v-model="form.state" prepend-icon="ion:map-outline" color="#fff" size="md"
                    rounded="lg" placeholder="State" />
            </div>
        </div>

        <!-- Address 1 & 2 -->
        <div class="w-full flex flex-col items-start">
            <p class="text-md text-white/80">Address Line 1:</p>
            <FormInput class="w-full" v-model="form.address1" prepend-icon="ion:home-outline" color="#fff" size="md"
                rounded="lg" placeholder="House no, street, area..." />
        </div>
        <div class="w-full flex flex-col items-start">
            <p class="text-md text-white/80">Address Line 2:</p>
            <FormInput class="w-full" v-model="form.address2" prepend-icon="ion:home-outline" color="#fff" size="md"
                rounded="lg" placeholder="Landmark, locality..." />
        </div>

        <!-- City & Pincode -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="w-full flex flex-col items-start">
                <p class="text-md text-white/80">City:</p>
                <FormInput class="w-full" v-model="form.city" prepend-icon="ion:location-outline" color="#fff" size="md"
                    rounded="lg" placeholder="City / Town" />
            </div>
            <div class="w-full flex flex-col items-start">
                <p class="text-md text-white/80">Pincode:</p>
                <FormInput class="w-full" v-model="form.pincode" prepend-icon="ion:mail-outline" color="#fff" size="md"
                    rounded="lg" placeholder="Pincode" />
            </div>
        </div>

        <!-- Description -->
        <div class="w-full flex flex-col items-start">
            <p class="text-md text-white/80">Description:</p>
            <textarea v-model="form.description" rows="3" placeholder="Notes about this location..."
                class="w-full resize-none rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-emerald-300/60"></textarea>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { timezoneGroups } from '~/data/timezones'

const props = defineProps({
    organizationId: { type: String, required: true },
    organizationName: { type: String, default: 'Main Organization' },
    branches: { type: Array, default: () => [] },
    item: { type: Object, default: null },
})

const emit = defineEmits(['submit'])

const form = reactive({
    entity: null,
    is_headquarters: false,
    timezone: '',
    searchQuery: '',
    country: '',
    state: '',
    address1: '',
    address2: '',
    city: '',
    pincode: '',
    description: '',
    latitude: null,
    longitude: null,
    place_id: '',
    formatted_address: '',
})

const entityOptions = computed(() => [
    { value: `org:${props.organizationId}`, label: `${props.organizationName} (Main Organization)`, icon: 'ion:business' },
    ...props.branches.map(b => ({
        value: `branch:${b.id}`,
        label: b.name,
        icon: b.is_active ? 'lucide:building-2' : 'lucide:building',
    })),
])

const resetForm = () => {
    Object.assign(form, {
        entity: entityOptions.value.find(o => o.value === `org:${props.organizationId}`) || null,
        is_headquarters: false,
        timezone: '',
        searchQuery: '',
        country: '',
        state: '',
        address1: '',
        address2: '',
        city: '',
        pincode: '',
        description: '',
        latitude: null,
        longitude: null,
        place_id: '',
        formatted_address: '',
    })
}

const loadItem = (item) => {
    if (!item) return resetForm()
    const entityValue = item.entity_type === 'branch'
        ? `branch:${item.entity_id}`
        : `org:${props.organizationId}`
    Object.assign(form, {
        entity: entityOptions.value.find(o => o.value === entityValue) || null,
        is_headquarters: !!item.is_headquarters,
        timezone: item.timezone || '',
        searchQuery: item.formatted_address || '',
        country: item.country || '',
        state: item.state || '',
        address1: item.address1 || '',
        address2: item.address2 || '',
        city: item.city || '',
        pincode: item.pincode || '',
        description: item.description || '',
        latitude: item.latitude ?? null,
        longitude: item.longitude ?? null,
        place_id: item.place_id || '',
        formatted_address: item.formatted_address || '',
    })
}

watch(() => props.item, (v) => loadItem(v), { immediate: true })

const onPlace = (place) => {
    Object.assign(form, {
        searchQuery: place.formatted_address,
        latitude: place.latitude,
        longitude: place.longitude,
        place_id: place.place_id,
        formatted_address: place.formatted_address,
    })
    if (place.country) form.country = place.country
    if (place.state) form.state = place.state
    if (place.city) form.city = place.city
    if (place.pincode) form.pincode = place.pincode
    if (place.address1) form.address1 = place.address1
    if (place.address2) form.address2 = place.address2
}

const submit = () => {
    const raw = form.entity?.value ?? form.entity
    const [type, id] = String(raw || '').split(':')
    emit('submit', {
        entity_type: type === 'branch' ? 'branch' : 'organization',
        entity_id: id || null,
        is_headquarters: !!form.is_headquarters,
        timezone: form.timezone,
        country: form.country,
        state: form.state,
        address1: form.address1,
        address2: form.address2,
        city: form.city,
        pincode: form.pincode,
        description: form.description,
        latitude: form.latitude,
        longitude: form.longitude,
        place_id: form.place_id,
        formatted_address: form.formatted_address,
    })
}

defineExpose({ submit })
</script>