<template>
    <div class="relative">
        <Icon name="ion:location-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-white/40" />
        <input ref="inputRef" v-model="query" type="text" :placeholder="placeholder" autocomplete="off"
            class="w-full rounded-lg border border-white/15 bg-black/20 py-2 pl-10 pr-3 text-sm text-white/90 placeholder-white/40 outline-none transition focus:border-emerald-300/60" />
        <span v-if="!hasKey"
            class="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] text-white/50">
            <Icon name="ion:key-outline" class="text-xs" />
            API key pending
        </span>
        <p v-if="!hasKey" class="mt-1 text-[10px] text-amber-300/80">
            Add NUXT_PUBLIC_GOOGLE_MAPS_KEY to enable Google Maps search &amp; autocomplete.
        </p>
    </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Search location (street, city, landmark)...' },
})

const emit = defineEmits(['update:modelValue', 'place'])

const runtimeConfig = useRuntimeConfig()
const hasKey = computed(() => !!runtimeConfig.public.googleMapsKey)

const inputRef = ref(null)
const query = ref(props.modelValue)
let autocomplete = null
let apiPromise = null

watch(() => props.modelValue, (v) => {
    if (v !== query.value) query.value = v
})

watch(query, (v) => emit('update:modelValue', v))

const loadGoogleMaps = () => {
    if (apiPromise) return apiPromise
    apiPromise = new Promise((resolve, reject) => {
        const key = runtimeConfig.public.googleMapsKey
        if (!key) return reject(new Error('Google Maps key not configured'))
        if (window.google?.maps) return resolve(window.google.maps)
        const callbackName = '__gmapcb' + Math.random().toString(36).slice(2)
        window[callbackName] = () => resolve(window.google.maps)
        const script = document.createElement('script')
        script.async = true
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=${callbackName}`
        script.onerror = () => { delete window[callbackName]; reject(new Error('Failed to load Google Maps')) }
        document.head.appendChild(script)
    })
    return apiPromise
}

const placeChanged = () => {
    const place = autocomplete?.getPlace()
    if (!place || !place.geometry) return
    const components = {}
    ;(place.address_components || []).forEach(c => {
        c.types.forEach(t => { (components[t] ??= []).push(c.long_name) })
    })
    query.value = place.formatted_address || query.value
    emit('place', {
        place_id: place.place_id || '',
        formatted_address: place.formatted_address || '',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        address1: [components.street_number?.[0], components.route?.[0]].filter(Boolean).join(' '),
        address2: [components.subpremise?.[0], components.neighborhood?.[0]].filter(Boolean).join(', '),
        city: components.locality?.[0] || components.sublocality_level_1?.[0] || components.postal_town?.[0] || '',
        state: components.administrative_area_level_1?.[0] || '',
        country: components.country?.[0] || '',
        postal_code: components.postal_code?.[0] || '',
    })
}

const initAutocomplete = async () => {
    if (!hasKey.value || !inputRef.value) return
    try {
        const maps = await loadGoogleMaps()
        if (!maps.places) return
        autocomplete = new maps.places.Autocomplete(inputRef.value, {
            types: ['address'],
            componentRestrictions: undefined,
            fields: ['place_id', 'formatted_address', 'geometry', 'address_components'],
        })
        autocomplete.addListener('place_changed', placeChanged)
    } catch {
        // silently keep plain text input when maps unavailable
    }
}

onMounted(() => setTimeout(initAutocomplete, 0))
onBeforeUnmount(() => autocomplete?.unbindAll?.())
</script>